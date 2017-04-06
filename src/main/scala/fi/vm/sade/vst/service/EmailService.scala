package fi.vm.sade.vst.service

import fi.vm.sade.groupemailer._
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model.{EmailEvent, Release}
import fi.vm.sade.vst.repository.RepositoryModule
import fi.vm.sade.vst.security.{KayttooikeusService, RequestMethod, CasUtils}
import java.time.LocalDate
import scala.util.{Failure, Success, Try}
import play.api.libs.json._

class EmailService(casUtils: CasUtils,
                   val accessService: KayttooikeusService)
  extends RepositoryModule
  with GroupEmailComponent
  with Configuration
  with JsonFormats {

  sealed trait EmailEventType { val description: String }
  case object ImmediateEmail extends EmailEventType { val description = "Immediately sent email" }
  case object TimedEmail extends EmailEventType { val description = "Normally timed email" }
  sealed case class UserOidEmail(userOid: String, email: String)
  sealed case class BasicUserInformation(userOid: String, email: String, languages: Seq[String])

  lazy val emailConfiguration = new GroupEmailerSettings(config)
  lazy val groupEmailService: GroupEmailService = new RemoteGroupEmailService(emailConfiguration, "virkailijan-tyopoyta-emailer")
//  lazy val groupEmailService: GroupEmailService = new FakeGroupEmailService
  private def casClient = casUtils.serviceClient(emailConfig.serviceAddress)
  private def oppijanumeroRekisteri = casUtils.serviceClient(oppijanumeroRekisteriConfig.serviceAddress)

  implicit val localDateOrdering: Ordering[LocalDate] = Ordering.by(_.toEpochDay)

  private def parseLanguagesFromResponse(response: String): Map[String, Seq[String]] = {
    val json = Json.parse(response).asOpt[JsArray].map(_.value).getOrElse(Seq.empty)
    val oidWithLanguages = json.map { value =>
      val oid = (value \ "oidHenkilo").as[String]
      val languages = (value \\ "kieliKoodi").map(_.as[String])
      (oid, languages)
    }
    oidWithLanguages.toMap
  }

  private def parseOidAndEmailFromResponse(response: String): Seq[UserOidEmail] = {
    Try(scala.xml.XML.loadString(response)) match {
      case Success(s) =>
        val rows = s \\ "rows"
        rows.map { row =>
          val oid = (row \ "henkiloOid").text
          val email = (row \ "henkiloEmail").text
          UserOidEmail(oid, email)
        }
      case Failure(f) =>
        Seq.empty
    }
  }

  private def parseResponse(resp: Try[String]): Seq[UserOidEmail] = {
    resp match {
      case Success(s) =>
        parseOidAndEmailFromResponse(s).filter(oidAndEmail => oidAndEmail.userOid.nonEmpty && oidAndEmail.email.nonEmpty)
      case Failure(f) =>
        Seq.empty
    }
  }

  private def parseUserLanguageInformation(resp: Try[String]): Map[String, Seq[String]] = {
    resp match {
      case Success(s) =>
        parseLanguagesFromResponse(s)
      case Failure(f) =>
        Map.empty
    }
  }

  def sendEmails(releases: Iterable[Release], eventType: EmailEventType): Iterable[String] = {
    val userInfoToReleases = releases.flatMap { release =>
      val oidsAndEmails = oidsAndEmailsForUserGroup(userGroupsForRelease(release))
      val userInfo = userInformation(oidsAndEmails)
      userInfo.map(_ -> release)
    }
    val userInfoToReleasesMap = userInfoToReleases.groupBy(_._1).mapValues(_.map(_._2))
    val result = userInfoToReleasesMap.flatMap {
      case (userInfo, releases) =>
        val recipients = List(formRecipient(userInfo.email))
        val email = formEmail(userInfo, releases)
        groupEmailService.sendMailWithoutTemplate(EmailData(email, recipients))
    }

    addEmailEvents(releases.map(releaseToEmailEvent(_, eventType)))
    result
  }

  def sendEmailsForDate(date: LocalDate): Unit = {
    // TODO: Should this just take range of dates? At the moment it is easier to just get evets for current and previous date
    val releases = releaseRepository.emailReleasesForDate(date)
    val previousDateReleases = releaseRepository.emailReleasesForDate(date.minusDays(1))
    sendEmails(releases ++ previousDateReleases, TimedEmail)
  }

  def formEmail(userInfo: BasicUserInformation, releases: Iterable[Release]): EmailMessage = {
    val language = userInfo.languages.headOption.getOrElse("fi") // Defaults to fi if no language is found
    val contentHeader = EmailTranslations.translation(language).getOrElse(EmailTranslations.EmailHeader, EmailTranslations.defaultEmailHeader)
    val contentBetween = EmailTranslations.translation(language).getOrElse(EmailTranslations.EmailContentBetween, EmailTranslations.defaultEmailContentBetween)
    val dates = releases.flatMap(_.notification.map(_.publishDate))
    val minDate = dates.min
    val maxDate = dates.max
    val formatter = java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")
    val subjectDateString =
      if (minDate == maxDate) s"${minDate.format(formatter)}"
      else s"$contentBetween ${minDate.format(formatter)} - ${maxDate.format(formatter)}"
    val subject = s"$contentHeader $subjectDateString"
    EmailMessage("virkailijan-tyopoyta", subject, EmailHtmlService.htmlString(releases, language), html = true)
  }

  def formRecipient(email: String): EmailRecipient = {
    EmailRecipient(email)
  }

  def releaseEventExists(release: Release): Boolean = emailRepository.existsForRelease(release.id)

  def userGroupsForRelease(release: Release): Seq[String] = {
    val userGroups = releaseRepository.userGroupsForRelease(release.id).map(_.usergroupId)
    accessService.appGroups.filter(appGroup => userGroups.contains(appGroup.id)).map(_.name)
  }

  def oidsAndEmailsForUserGroup(userGroups: Seq[String]): Seq[UserOidEmail] = {
    val userGroupsValues = userGroups.map(group => s""""$group"""").mkString(",")
    val json = s"""{
                 |  "searchTerms": {
                 |	  "searchType": "EMAIL",
                 |		"targetGroups": [{
                 |		  "options": ["TUNNUKSENHALTIJAT"],
                 |			"type": "KOULUTA_KAYTTAJAT"
                 |		}],
                 |		"terms": [{
                 |		  "type": "koulutaRoolis",
                 |			"values": [$userGroupsValues]
                 |		}]
                 |	}
                 |}""".stripMargin
    val body = Option(json)
    val response = casClient.authenticatedRequest(s"${emailConfig.serviceAddress}/api/search/list.json?lang=fi", RequestMethod.POST, mediaType = Option(org.http4s.MediaType.`application/json`), body = body)
    parseResponse(response)
  }

  private def userInformation(userOidAndEmail: Seq[UserOidEmail]): Seq[BasicUserInformation] = {
    val formattedOids = userOidAndEmail.map { oidAndEmail => s""""${oidAndEmail.userOid}""""}
    val json = s"""[${formattedOids.mkString(",")}]"""
    val body = Option(json)
    val response = oppijanumeroRekisteri.authenticatedRequest(s"${oppijanumeroRekisteriConfig.serviceAddress}/henkilo/henkiloPerustietosByHenkiloOidList", RequestMethod.POST, mediaType = Option(org.http4s.MediaType.`application/json`), body = body)
    val languages = parseUserLanguageInformation(response)
    basicUserInformation(userOidAndEmail, languages)
  }

  private def basicUserInformation(userOidAndEmail: Seq[UserOidEmail], userLanguages: Map[String, Seq[String]]): Seq[BasicUserInformation] = {
    userOidAndEmail.map { userInformation =>
      val languages = userLanguages.getOrElse(userInformation.userOid, Seq.empty)
      BasicUserInformation(userInformation.userOid, userInformation.email, languages)
    }
  }

  private def releaseToEmailEvent(release: Release, eventType: EmailEventType): EmailEvent = EmailEvent(0l, java.time.LocalDate.now(), release.id, eventType.description)

  private def addEmailEvents(emailEvents: Iterable[EmailEvent]): Iterable[EmailEvent] = emailEvents.flatMap(emailRepository.addEvent)
}
