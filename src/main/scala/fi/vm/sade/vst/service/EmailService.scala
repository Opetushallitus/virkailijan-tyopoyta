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
  sealed case class UniqueMessage(language: String, releases: Set[Release])

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
      logger.info(s"Forming emails on ${releases.size} releases to ${releaseSetsForUsers.size} users")
      val emailDatas = getEmailDatas(releaseSetsForUsers)

      logger.info(s"Sending ${emailDatas.size} unique emails")
      val result: Seq[String] = emailDatas.flatMap { data =>
        logger.info(s"Sending email to ${data.recipient.size} recipients")
        groupEmailService.sendMailWithoutTemplate(data)
      }
      logger.info(s"Finished sending emails")
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
      val filteredUsers: Set[BasicUserInformation] = filterUsersForReleases(release, usersForGroups)
      filteredUsers.map(_ -> release)
    }
    userReleasePairs.groupBy(_._1)
      .mapValues(_.map(_._2).toSet)
      .toSeq
  }

  private def userGroupIdsForRelease(release: Release): Set[Long] = {
    val virkailijanTyopoytaRoles: Set[Kayttooikeusryhma] = accessService.appGroups.toSet
    val userGroupsForRelease = releaseRepository.userGroupsForRelease(release.id).map(_.usergroupId).toSet

    val matchingGroupIds = if (userGroupsForRelease.isEmpty) {
      val releaseCategoryIds = release.categories
      if (releaseCategoryIds.isEmpty) {
        logger.info(s"User groups and categories for release are empty, selecting all user groups")
        virkailijanTyopoytaRoles.filter(_.categories.nonEmpty).map(_.id)
      } else {
        logger.info(s"User groups for release is empty, selecting all groups in categories ${releaseCategoryIds.mkString(",")}")
        val rolesInReleaseCategories = virkailijanTyopoytaRoles.filter(_.categories.intersect(releaseCategoryIds).nonEmpty)
        rolesInReleaseCategories.map(_.id)
      }
    } else {
      logger.info(s"User groups for release are ${userGroupsForRelease.mkString(",")}, filtering down to found" +
        s"virkailijan työpöytä roles")
      virkailijanTyopoytaRoles.map(_.id).intersect(userGroupsForRelease)
    }

    logger.info(s"${matchingGroupIds.size}/${userGroupsForRelease.size} user groups for release ${release.id} were" +
      s"found in KayttooikeusService. " +
      s"The following groups were not found: ${userGroupsForRelease.diff(matchingGroupIds).mkString(",")}.")

    if (matchingGroupIds.isEmpty) {
      val msg = "Error: none of the release's user groups were not found in KayttooikeusService cache. " +
        s"Is the service responding? release id: ${release.id}, release groups: ${userGroupsForRelease.mkString(",")}."
      logger.error(msg)
      throw new RuntimeException(msg)
    }

    matchingGroupIds
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
        val oids: Seq[String] = parsePersonOidsFromResponse(s)
        logger.info(s"kayttooikeus-service returned ${oids.size} personOids for user group $groupOid")
        oids
      case Failure(f) =>
        logger.error(s"Failure parsing person oids from response $response", f)
        Seq.empty
    }
  }

  private def getUserInformationsForOids(oids: Iterable[String]): Iterable[BasicUserInformation] = {
    val formattedOids = oids.map { oid => s""""$oid"""" }
    val json = s"""[${formattedOids.mkString(",")}]"""
    val url = s"${oppijanumeroRekisteriConfig.serviceAddress}/henkilo/henkilotByHenkiloOidList"
    logger.info(s"getting persons from oppijanumerorekisteri for ${oids.size} oids: $json")
    val response = oppijanumeroRekisteri.authenticatedJsonPost(url, json)

    val userInformations: Seq[UserInformation] = response match {
      case Success(s) =>
        parseUserInformationFromEmailResponse(s)
      case Failure(t) =>
        val msg = "Failed to fetch user oids and email addresses"
        logger.error(msg, t)
        throw new RuntimeException(msg, t)
    }

    val oidsInResponse = userInformations.map(_.oidHenkilo)
    logger.info(s"oppijanumerorekisteri returned ${userInformations.size} userInformations (of which ${oidsInResponse.toSet.size} have unique oidHenkilos).")
    val oidsNotInResponse = oids.toSet.diff(oidsInResponse.toSet)
    if (oidsNotInResponse.nonEmpty) {
      logger.warn(s"the following oids were not in the response oidHenkilos: ${oidsNotInResponse.mkString(", ")}.")
    }

    val basicUserInformations: Seq[BasicUserInformation] = userInformations.flatMap { userInfo =>
      userInfo.yhteystiedotRyhma.filter(_.ryhmaKuvaus == groupTypeFilter) match {
        case contactGroups if contactGroups.nonEmpty =>
          contactGroups.flatMap(_.yhteystieto).filter(_.yhteystietoTyyppi == contactTypeFilter) match {
            case contactInfos if contactInfos.nonEmpty =>
              if (contactInfos.length > 1) {
                logger.warn(s"userInfo with oid ${userInfo.oidHenkilo} had multiple (${contactInfos.length}) suitable email addresses.")
              }
              contactInfos.map { contactInfo =>
                val email = contactInfo.yhteystietoArvo.getOrElse(throw new RuntimeException("email was null in yhteystieto " + contactInfo))
                val kieliKoodi = userInfo.asiointiKieli.map(_.kieliKoodi).getOrElse("fi")
                BasicUserInformation(userInfo.oidHenkilo, email, Seq(kieliKoodi))
              }
            case _ =>
              logger.warn(s"userInfo with oid ${userInfo.oidHenkilo} had no yhteystietos with yhteystietotyyppi ${contactTypeFilter} with ryhmakuvaus ${groupTypeFilter}")
              Nil
          }
        case _ =>
          logger.warn(s"userInfo with oid ${userInfo.oidHenkilo} had no yhteystiedotRyhmas with ryhmakuvaus ${groupTypeFilter}")
          Nil
      }
    }

    logger.info(s"converted ${userInformations.size} userInformations to ${basicUserInformations.size} basicUserInformations with oids: ${basicUserInformations.map(_.userOid).mkString(", ")}.")
    basicUserInformations
  }

  private def filterUsersForReleases(release: Release, users: Seq[BasicUserInformation]): Set[BasicUserInformation] = {
    val userOids = users.map(_.userOid)
    val userProfiles = userService.userProfiles(userOids)
    logger.info(s"user repository returned ${userProfiles.size} user profiles for ${users.size} userOids (of which ${userOids.toSet.size} were unique oids)")

    val userOidsToProfiles: Map[String, UserProfile] = userProfiles.map(profile => profile.userId -> profile).toMap
    val sendToPersonsWithNoProfile: Boolean = true

    val includedUsers: Set[BasicUserInformation] = users.filter { user =>
      val profileOpt: Option[UserProfile] = userOidsToProfiles.get(user.userOid)
      profileOpt match {
        case None =>
          if (sendToPersonsWithNoProfile) {
            logger.warn(s"Profile for user ${user.userOid} was not found in user repository, sending email anyway")
            true
          } else {
            logger.warn(s"Profile for user ${user.userOid} was not found in user repository, skipping email sending")
            false
          }
        case Some(profile) if !profile.sendEmail =>
            logger.warn(s"Not including user ${user.userOid} in emails because sendEmail for user is false.")
            false
        case Some(profile) =>
            true
      }
    }.toSet

    logger.warn(s"Filtered ${users.size} down to ${includedUsers.size} profiles to be included in emails " +
      s"(with ${includedUsers.map(_.userOid)} unique userOids)")

    includedUsers
  }

  private def getEmailDatas(releaseSetsForUsers: Seq[(BasicUserInformation, Set[Release])]): Seq[EmailData]  = {
    val recipientsToUniqueMessages: Map[EmailRecipient, UniqueMessage] = releaseSetsForUsers.map{case (u, r) =>
      val language = u.languages.headOption.getOrElse("fi") // Defaults to fi if no language is found
      (EmailRecipient(u.email), UniqueMessage(language, r))
    }.toMap
    logger.info(s"recipients count: ${recipientsToUniqueMessages.size}")
    val recipients: Seq[EmailRecipient] = recipientsToUniqueMessages.keys.toSeq
    val duplicates = recipients.map(r => recipients.count(_ == r)).filter(_ > 1).toSet
    if (duplicates.nonEmpty) {
      logger.info(s"the following email addresses appeared more than once: ${duplicates.mkString(" ")}")
    }

    val uniqueMessagesToEmails: Map[UniqueMessage, EmailMessage] = recipientsToUniqueMessages.values.toSet.map{um: UniqueMessage =>
      (um, formEmail(um.language, um.releases))
    }.toMap
    logger.info(s"unique messages count: ${uniqueMessagesToEmails.size}")

    val recipientsToEmails: Map[EmailRecipient, EmailMessage] = recipientsToUniqueMessages.map{p =>
      (p._1, uniqueMessagesToEmails.apply(p._2))
    }

    val emailsToRecipients: Map[EmailMessage, Set[EmailRecipient]] = recipientsToEmails.groupBy(_._2).mapValues(_.keys.toSet)

    emailsToRecipients.map{ p =>
      val recipients: Set[EmailRecipient] = p._2
      EmailData(p._1, recipients.toList)
    }.toSeq
  }

  private def formEmail(language: String, releases: Set[Release]): EmailMessage = {
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

    logger.info(s"Adding ${releases.length} email events of type '${eventType.description}' to database")
    val emailEvents = releases.map(releaseToEmailEvent)
    emailEvents.flatMap(emailRepository.addEvent(_))
  }
}
