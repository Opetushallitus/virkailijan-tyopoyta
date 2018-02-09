package fi.vm.sade.vst.service

import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.groupemailer._
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model.{EmailEvent, JsonSupport, Release, UserInformation}
import fi.vm.sade.vst.module.RepositoryModule
import fi.vm.sade.vst.security.{CasUtils, KayttooikeusService, RequestMethod, UserService}
import fi.vm.sade.vst.util.IterableUtils
import java.time.LocalDate

import com.typesafe.scalalogging.LazyLogging

import scala.util.{Failure, Success, Try}
import play.api.libs.json._

class EmailService(casUtils: CasUtils,
                   val accessService: KayttooikeusService,
                   val userService: UserService)
  extends RepositoryModule
  with GroupEmailComponent
  with Configuration
  with JsonFormats
  with LazyLogging
  with JsonSupport {

  sealed trait EmailEventType {
    val description: String
  }

  case object ImmediateEmail extends EmailEventType {
    val description = "Immediately sent email"
  }

  case object TimedEmail extends EmailEventType {
    val description = "Normally timed email"
  }

  sealed case class UserOidEmail(userOid: String, email: String)
  sealed case class BasicUserInformation(userOid: String, email: String, languages: Seq[String])

  val groupTypeFilter = "yhteystietotyyppi2"
  val contactTypeFilter = "YHTEYSTIETO_SAHKOPOSTI"

  lazy val emailConfiguration = new GroupEmailerSettings(config)
  lazy val groupEmailService: GroupEmailService = new RemoteGroupEmailService(emailConfiguration, "virkailijan-tyopoyta-emailer")

  private def oppijanumeroRekisteri = casUtils.serviceClient(oppijanumeroRekisteriConfig.serviceAddress)
  private def userAccessService = casUtils.serviceClient(urls.url("kayttooikeus-service.url"))

  implicit val localDateOrdering: Ordering[LocalDate] = Ordering.by(_.toEpochDay)

  private def parseUserInformationFromResponse(response: String): Seq[UserInformation] = {
    val json = Json.parse(response).asOpt[JsArray].map(_.value).getOrElse(Seq.empty)
    val userInformation = json.flatMap(parseSingleUserInformation)
    userInformation
  }

  private def parsePersonOidsFromResponse(response: String): Seq[String] = {
    val json = Json.parse(response)
    val personOids = (json \ "personOids").asOpt[Seq[String]].getOrElse(Seq.empty)
    personOids
  }

  private def parseUserOidsAndEmails(resp: Try[String]): Seq[UserInformation] = {
    resp match {
      case Success(s) =>
        parseUserInformationFromResponse(s)
      case Failure(f) =>
        logger.error("Failed to parse user oids and emails", f)
        Seq.empty
    }
  }

  private def filterUserInformation(release: Release, userInformation: Seq[BasicUserInformation]): Seq[BasicUserInformation] = {
    val userProfiles = userService.userProfiles(userInformation.map(_.userOid)).map(profile => profile.userId -> profile).toMap

    userInformation.filter { user =>
      val profile = userProfiles.get(user.userOid)
      val profileCategories = profile.map(_.categories).getOrElse(Seq.empty)
      val hasAllowedCategories: Boolean = release.categories.isEmpty || profileCategories.isEmpty || profileCategories.intersect(release.categories).nonEmpty

      val sendEmail: Boolean = !profile.exists(!_.sendEmail)
      sendEmail && hasAllowedCategories
    }
  }

  def sendEmails(releases: Iterable[Release], eventType: EmailEventType)(implicit au: AuditUser): Iterable[String] = {
    val userInfoToReleases = releases.flatMap { release =>
      val userGroups = userGroupIdsForRelease(release)
      val userInformation = basicUserInformationForUserGroups(userGroups)
      val userInfo = filterUserInformation(release, userInformation)
      userInfo.map(_ -> release)
    }
    val userInfoToReleasesMap = userInfoToReleases.groupBy(_._1).mapValues(_.map(_._2))
    logger.info(s"Sending emails on ${releases.size} releases to ${userInfoToReleases.size} users")
    val result = userInfoToReleasesMap.flatMap {
      case (userInfo, releasesForUser) =>
        val recipients = List(formRecipient(userInfo.email))
        val email = formEmail(userInfo, releasesForUser)
        groupEmailService.sendMailWithoutTemplate(EmailData(email, recipients))
    }

    addEmailEvents(releases.map(releaseToEmailEvent(_, eventType)))
    result
  }

  def sendEmailsForDate(date: LocalDate)(implicit au: AuditUser): Unit = {
    // TODO: Should this just take range of dates? At the moment it is easier to just get evets for current and previous date
    logger.info(s"Preparing to send emails for date $date")
    val releases = releaseRepository.getEmailReleasesForDate(date)
    val previousDateReleases = releaseRepository.getEmailReleasesForDate(date.minusDays(1))
    sendEmails(releases ++ previousDateReleases, TimedEmail)
  }

  private def formEmail(userInfo: BasicUserInformation, releases: Iterable[Release]): EmailMessage = {
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

    val htmlString: String = EmailHtmlService.htmlString(releases, language)

    val longestLine: String = htmlString.split("\n").maxBy(_.length)
    val maxLineLength: Int = longestLine.length
    val warnLimitLength: Int = 500
    if (maxLineLength > warnLimitLength) {
      logger.error(s"Longest line was ${maxLineLength} characters, which is over the warning limit of ${warnLimitLength}, in email to user ${userInfo.userOid}. Offending line starts: ${longestLine.take(20)}...")
    }

    EmailMessage("virkailijan-tyopoyta", subject, htmlString, html = true)
  }

  private def formRecipient(email: String): EmailRecipient = {
    EmailRecipient(email)
  }

  private def userGroupIdsForRelease(release: Release): Seq[Long] = {
    val userGroups = releaseRepository.userGroupsForRelease(release.id).map(_.usergroupId)
    accessService.appGroups.filter(appGroup => userGroups.contains(appGroup.id)).map(_.id)
  }

  private def personOidsForUserGroup(groupOid: Long): Seq[String] = {
    val response = userAccessService.authenticatedRequest(urls.url("kayttooikeus-service.personOidsForUserGroup", groupOid.toString), RequestMethod.GET)
    response match {
      case Success(s) =>
        parsePersonOidsFromResponse(s)
      case Failure(f) =>
        logger.error(s"Failure parsing person oids from response $response", f)
        Seq.empty
    }
  }

  private def userInformationByOids(oids: Iterable[String]): Iterable[BasicUserInformation] = {
    val formattedOids = oids.map { oid => s""""$oid"""" }
    val json = s"""[${formattedOids.mkString(",")}]"""
    val body = Option(json)

    val response = oppijanumeroRekisteri.authenticatedRequest(s"${oppijanumeroRekisteriConfig.serviceAddress}/henkilo/henkilotByHenkiloOidList", RequestMethod.POST, mediaType = Option(org.http4s.MediaType.`application/json`), body = body)
    val userInformation = parseUserOidsAndEmails(response)
    for {
      userInfo <- userInformation
      contactGroups <- userInfo.yhteystiedotRyhma.filter(_.ryhmaKuvaus == groupTypeFilter)
      contactInfo <- contactGroups.yhteystieto.filter(_.yhteystietoTyyppi == contactTypeFilter)
    } yield BasicUserInformation(userInfo.oidHenkilo, contactInfo.yhteystietoArvo, Seq(userInfo.asiointiKieli.kieliKoodi))
  }

  private def basicUserInformationForUserGroups(userGroups: Seq[Long]): Seq[BasicUserInformation] = {
    val personOids = userGroups.flatMap(personOidsForUserGroup).distinct
    IterableUtils.mapToSplitted(450, personOids, userInformationByOids).toSeq
  }

  private def releaseToEmailEvent(release: Release, eventType: EmailEventType): EmailEvent = {
    EmailEvent(0l, java.time.LocalDate.now(), release.id, eventType.description)
  }

  private def addEmailEvents(emailEvents: Iterable[EmailEvent])(implicit au: AuditUser): Iterable[EmailEvent] = {
    emailEvents.flatMap(emailRepository.addEvent(_))
  }
}
