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

  def sendEmailsForDate(date: LocalDate)(implicit au: AuditUser): Unit = {
    // TODO: Should this just take range of dates? At the moment it is easier to just get evets for current and previous date
    logger.info(s"Preparing to send emails for date $date")
    val releases = releaseRepository.getEmailReleasesForDate(date)
    val previousDateReleases = releaseRepository.getEmailReleasesForDate(date.minusDays(1))
    val results: Seq[String] = sendEmails(releases ++ previousDateReleases, TimedEmail)
    logger.info("sendEmailsForDate result: " + results.mkString(", "))
  }

  def sendEmails(releases: Seq[Release], eventType: EmailEventType)(implicit au: AuditUser): Seq[String] = {
    val releaseSetsForUsers: Seq[(BasicUserInformation, Set[Release])] = getUsersToReleaseSets(releases)

    if (releaseSetsForUsers.isEmpty) {
      logger.info(s"Skipping sending emails on ${releases.size} releases because only ${releaseSetsForUsers.size} users found")
      Seq.empty
    } else {
      logger.info(s"Sending emails on ${releases.size} releases to ${releaseSetsForUsers.size} users")
      val result = releaseSetsForUsers.flatMap {
        case (userInfo, releasesForUser) =>
          val recipient = EmailRecipient(userInfo.email)
          val emailMessage = formEmail(userInfo, releasesForUser)
          groupEmailService.sendMailWithoutTemplate(EmailData(emailMessage, List(recipient)))
      }
      addEmailEvents(releases, eventType)
      result
    }
  }


  private def getUsersToReleaseSets(releases: Seq[Release]): Seq[(BasicUserInformation, Set[Release])] = {
    val userReleasePairs: Seq[(BasicUserInformation, Release)] = releases.flatMap { release =>
      val userGroups: Set[Long] = userGroupIdsForRelease(release)
      logger.info(s"Groups for release ${release.id}: ${userGroups.mkString(", ")}")
      val usersForGroups: Seq[BasicUserInformation] = getUserInformationsForGroups(userGroups)
      if (usersForGroups.isEmpty) {
        logger.warn(s"No users found in groups for release ${release.id}")
      }
      val filteredUsers: Seq[BasicUserInformation] = filterUsersForReleases(release, usersForGroups)
      filteredUsers.map(_ -> release)
    }
    userReleasePairs.groupBy(_._1)
      .mapValues(_.map(_._2).toSet)
      .toSeq
  }

  private def userGroupIdsForRelease(release: Release): Set[Long] = {
    val virkailijanTyopoytaRoles: Seq[Long] = accessService.appGroups.map(_.id)
    val userGroupsForRelease = releaseRepository.userGroupsForRelease(release.id).map(_.usergroupId)

    val allUsersGroupId: Long = -1L
    if (userGroupsForRelease.contains(allUsersGroupId)) {
      logger.info(s"Special user group $allUsersGroupId in release so selecting all user groups")
      virkailijanTyopoytaRoles.toSet
    } else {
      virkailijanTyopoytaRoles.intersect(userGroupsForRelease).toSet
    }
  }

  private def getUserInformationsForGroups(userGroups: Set[Long]): Seq[BasicUserInformation] = {
    val personOids = userGroups.flatMap(personOidsForUserGroup)
    IterableUtils.mapToSplitted(450, personOids, getUserInformationsForOids).toSeq
  }
  private def personOidsForUserGroup(groupOid: Long): Seq[String] = {
    def parsePersonOidsFromResponse(response: String): Seq[String] = {
      val json = Json.parse(response)
      val personOids = (json \ "personOids").asOpt[Seq[String]].getOrElse(Seq.empty)
      personOids
    }

    val response = userAccessService.authenticatedRequest(urls.url("kayttooikeus-service.personOidsForUserGroup", groupOid.toString), RequestMethod.GET)
    response match {
      case Success(s) =>
        parsePersonOidsFromResponse(s)
      case Failure(f) =>
        logger.error(s"Failure parsing person oids from response $response", f)
        Seq.empty
    }
  }

  private def getUserInformationsForOids(oids: Iterable[String]): Iterable[BasicUserInformation] = {
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

  private def parseUserOidsAndEmails(resp: Try[String]): Seq[UserInformation] = {
    resp match {
      case Success(s) =>
        parseUserInformationFromEmailResponse(s)
      case Failure(f) =>
        logger.error("Failed to parse user oids and emails", f)
        Seq.empty
    }
  }

  private def filterUsersForReleases(release: Release, users: Seq[BasicUserInformation]): Seq[BasicUserInformation] = {
    val userOidsToProfiles = userService.userProfiles(users.map(_.userOid)).map(profile => profile.userId -> profile).toMap

    val includedUsers: Seq[BasicUserInformation] = users.filter { user =>
      val profileOpt: Option[UserProfile] = userOidsToProfiles.get(user.userOid)
      profileOpt match {
        case None =>
          logger.warn(s"Profile for user ${user.userOid} was not found in user repository, sending email anyway")
          true
        case Some(profile) =>
          val profileCategories = profile.categories
          val hasAllowedCategories: Boolean = release.categories.isEmpty || profileCategories.isEmpty || profileCategories.intersect(release.categories).nonEmpty

          val sendEmail: Boolean = profile.sendEmail
          val isIncluded = sendEmail && hasAllowedCategories
          if (!isIncluded) {
            val msg = s"Not including user ${user.userOid} in emails because: " +
              (if (!sendEmail) "sendEmail for user is false. " else "") +
              (if (!hasAllowedCategories) "user has none of the included categories." else "")
            logger.warn(msg)
          }
          isIncluded
      }
    }

    logger.warn(s"Filtered ${users.size} down users to ${includedUsers.size} users to be included in emails")

    includedUsers
  }


  private def formEmail(user: BasicUserInformation, releases: Set[Release]): EmailMessage = {
    val language = user.languages.headOption.getOrElse("fi") // Defaults to fi if no language is found

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


  private def addEmailEvents(releases: Seq[Release], eventType: EmailEventType)(implicit au: AuditUser): Seq[EmailEvent] = {
    def releaseToEmailEvent(release: Release) = EmailEvent(0l, java.time.LocalDate.now(), release.id, eventType.description)

    val emailEvents = releases.map(releaseToEmailEvent)
    emailEvents.flatMap(emailRepository.addEvent(_))
  }
}
