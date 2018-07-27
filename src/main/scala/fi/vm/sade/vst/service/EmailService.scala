package fi.vm.sade.vst.service

import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.groupemailer._
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model._
import fi.vm.sade.vst.module.RepositoryModule
import fi.vm.sade.vst.security.{CasUtils, KayttooikeusService, RequestMethod, UserService}
import fi.vm.sade.vst.util.IterableUtils
import java.time.LocalDate
import java.time.format.DateTimeFormatter

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

  sealed case class BasicUserInformation(userOid: String, email: String, languages: Seq[String])

  val groupTypeFilter = "yhteystietotyyppi2"
  val contactTypeFilter = "YHTEYSTIETO_SAHKOPOSTI"

  lazy val emailConfiguration = new GroupEmailerSettings(config)
  lazy val groupEmailService: GroupEmailService = new RemoteGroupEmailService(emailConfiguration, "virkailijan-tyopoyta-emailer")

  private def oppijanumeroRekisteri = casUtils.serviceClient(oppijanumeroRekisteriConfig.serviceAddress)
  private def userAccessService = casUtils.serviceClient(urls.url("kayttooikeus-service.url"))

  implicit val localDateOrdering: Ordering[LocalDate] = Ordering.by(_.toEpochDay)
  private val dateTimeFormat: DateTimeFormatter = java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")

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
    val userOidsToProfiles = userService.userProfiles(userInformation.map(_.userOid)).map(profile => profile.userId -> profile).toMap

    userInformation.filter { user =>
      val profile: Option[UserProfile] = userOidsToProfiles.get(user.userOid)

      val profileCategories = profile.map(_.categories).getOrElse(Seq.empty)
      val hasAllowedCategories: Boolean = release.categories.isEmpty || profileCategories.isEmpty || profileCategories.intersect(release.categories).nonEmpty

      val sendEmail: Boolean = profile.map(_.sendEmail).getOrElse(true)
      sendEmail && hasAllowedCategories
    }
  }

  def sendEmails(releases: Seq[Release], eventType: EmailEventType)(implicit au: AuditUser): Seq[String] = {
    val userInfoToReleasesMap: Map[BasicUserInformation, Set[Release]] = getUsersToReleases(releases)

    logger.info(s"Sending emails on ${releases.size} releases to ${userInfoToReleasesMap.size} users")

    val result = userInfoToReleasesMap.flatMap {
      case (userInfo, releasesForUser) =>
        val recipients = List(formRecipient(userInfo.email))
        val emailMessage = formEmail(userInfo, releasesForUser)
        groupEmailService.sendMailWithoutTemplate(EmailData(emailMessage, recipients))
    }.toSeq

    addEmailEvents(releases.map(releaseToEmailEvent(_, eventType)))
    result
  }

  private def getUsersToReleases(releases: Seq[Release]): Map[BasicUserInformation, Set[Release]] = {
    val userInfoToReleases: Seq[(BasicUserInformation, Release)] = releases.flatMap { release =>
      val userGroups: Set[Long] = userGroupIdsForRelease(release)
      val userInformation: Seq[BasicUserInformation] = basicUserInformationForUserGroups(userGroups)
      val userInfo: Seq[BasicUserInformation] = filterUserInformation(release, userInformation)
      userInfo.map(_ -> release)
    }
    val userInfoToReleasesMap: Map[BasicUserInformation, Set[Release]] = userInfoToReleases.groupBy(_._1).mapValues(_.map(_._2).toSet)
    userInfoToReleasesMap
  }

  def sendEmailsForDate(date: LocalDate)(implicit au: AuditUser): Unit = {
    // TODO: Should this just take range of dates? At the moment it is easier to just get evets for current and previous date
    logger.info(s"Preparing to send emails for date $date")
    val releases = releaseRepository.getEmailReleasesForDate(date)
    val previousDateReleases = releaseRepository.getEmailReleasesForDate(date.minusDays(1))
    val results: Seq[String] = sendEmails(releases ++ previousDateReleases, TimedEmail)
  }

  private def formEmail(userInfo: BasicUserInformation, releases: Set[Release]): EmailMessage = {
    val language = userInfo.languages.headOption.getOrElse("fi") // Defaults to fi if no language is found

    val translationsMap = EmailTranslations.translation(language)
    val contentHeader = translationsMap.getOrElse(EmailTranslations.EmailHeader, EmailTranslations.defaultEmailHeader)
    val contentBetween = translationsMap.getOrElse(EmailTranslations.EmailContentBetween, EmailTranslations.defaultEmailContentBetween)
    val dates = releases.flatMap(_.notification.map(_.publishDate))
    val (minDate, maxDate) = (dates.min, dates.max)
    val subjectDateString =
      if (minDate == maxDate) s"${minDate.format(dateTimeFormat)}"
      else s"$contentBetween ${minDate.format(dateTimeFormat)} - ${maxDate.format(dateTimeFormat)}"
    val subject = s"$contentHeader $subjectDateString"
    EmailMessage("virkailijan-tyopoyta", subject, EmailHtmlService.htmlString(releases, language), html = true)
  }

  private def formRecipient(email: String): EmailRecipient = {
    EmailRecipient(email)
  }

  private def userGroupIdsForRelease(release: Release): Set[Long] = {
    val userGroupsForRelease = releaseRepository.userGroupsForRelease(release.id).map(_.usergroupId)
    val virkailijanTyopoytaRoles: Seq[Long] = accessService.appGroups.map(_.id)
    virkailijanTyopoytaRoles.intersect(userGroupsForRelease).toSet
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

    val url = s"${oppijanumeroRekisteriConfig.serviceAddress}/henkilo/henkilotByHenkiloOidList"
    val response = oppijanumeroRekisteri.authenticatedRequest(url, RequestMethod.POST, mediaType = Option(org.http4s.MediaType.`application/json`), body = body)
    val userInformation: Seq[UserInformation] = parseUserOidsAndEmails(response)
    for {
      userInfo <- userInformation
      contactGroups <- userInfo.yhteystiedotRyhma.filter(_.ryhmaKuvaus == groupTypeFilter)
      contactInfo <- contactGroups.yhteystieto.filter(_.yhteystietoTyyppi == contactTypeFilter)
    } yield BasicUserInformation(userInfo.oidHenkilo, contactInfo.yhteystietoArvo, Seq(userInfo.asiointiKieli.kieliKoodi))
  }

  private def basicUserInformationForUserGroups(userGroups: Set[Long]): Seq[BasicUserInformation] = {
    val personOids = userGroups.flatMap(personOidsForUserGroup)
    IterableUtils.mapToSplitted(450, personOids, userInformationByOids).toSeq
  }

  private def releaseToEmailEvent(release: Release, eventType: EmailEventType): EmailEvent = {
    EmailEvent(0l, java.time.LocalDate.now(), release.id, eventType.description)
  }

  private def addEmailEvents(emailEvents: Seq[EmailEvent])(implicit au: AuditUser): Seq[EmailEvent] = {
    emailEvents.flatMap(emailRepository.addEvent(_))
  }
}
