package fi.vm.sade.vst.service

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import com.typesafe.scalalogging.LazyLogging
import fi.oph.viestinvalitys.{ViestinvalitysClient, ViestinvalitysClientException}
import fi.oph.viestinvalitys.vastaanotto.model.{BuilderException, Lahetys, LuoViestiSuccessResponse, Vastaanottajat, Viesti}
import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model._
import fi.vm.sade.vst.module.RepositoryModule
import fi.vm.sade.vst.security.{CasUtils, KayttooikeusService, RequestMethod, UserService}
import fi.vm.sade.vst.util.IterableUtils
import play.api.libs.json._

import java.util.{Optional, UUID}
import scala.util.{Failure, Success}
import collection.JavaConverters._

class EmailService(casUtils: CasUtils,
                   val accessService: KayttooikeusService,
                   val userService: UserService)
  extends RepositoryModule
    with Configuration
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


  lazy val viestinvalitysClient =
    ViestinvalitysClient.builder()
      .withEndpoint(config.getString("viestinvalityspalvelu.rest.url"))
      .withUsername(config.getString("virkailijan-tyopoyta.cas.user"))
      .withPassword(config.getString("virkailijan-tyopoyta.cas.password"))
      .withCasEndpoint(config.getString("cas.url"))
      .withCallerId(this.callerId)
      .build()

  private def oppijanumeroRekisteri = casUtils.serviceClient(oppijanumeroRekisteriConfig.serviceAddress)

  private def userAccessService = casUtils.serviceClient(urls.url("kayttooikeus-service.url"))

  implicit val localDateOrdering: Ordering[LocalDate] = Ordering.by(_.toEpochDay)
  private val dateTimeFormat: DateTimeFormatter = java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")

  def sendEmailsForDate(date: LocalDate)(implicit au: AuditUser): Unit = {
    // TODO: Should this just take range of dates? At the moment it is easier to just get evets for current and previous date
    logger.info(s"Preparing to send emails for date $date")
    val releases = releaseRepository.getEmailReleasesForDate(date)
    val previousDateReleases = releaseRepository.getEmailReleasesForDate(date.minusDays(1))
    val results: Seq[LuoViestiSuccessResponse] = sendEmails(releases ++ previousDateReleases, TimedEmail)
    logger.info("sendEmailsForDate result: " + results.map(r => r.getViestiTunniste).mkString(", "))
  }

  def sendEmails(releases: Seq[Release], eventType: EmailEventType)(implicit au: AuditUser): Seq[LuoViestiSuccessResponse] = {
    if (!emailSendingDisabled) {
      val releaseSetsForUsers: Seq[(BasicUserInformation, Set[Release])] = getUsersToReleaseSets(releases)

      if (releaseSetsForUsers.isEmpty) {
        logger.info(s"Skipping sending emails on ${releases.size} releases because only ${releaseSetsForUsers.size} users found")
        Seq.empty
      } else {
        logger.info(s"Forming emails on ${releases.size} releases to ${releaseSetsForUsers.size} users")

        try {
          // lähetykselle geneerinen otsikko aikaleimalla, koska kerralla lähetetään useita viestejä
          val luoLahetysResponse = viestinvalitysClient.luoLahetys(Lahetys.builder()
            .withOtsikko("Virkailijan työpöydän tiedotteet " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd.MM.YYYY hh:mm")))
            .withLahettavaPalvelu("virkailijantyopoyta")
            .withLahettaja(Optional.empty.asInstanceOf[Optional[String]], "noreply@opintopolku.fi")
            .withNormaaliPrioriteetti()
            .withSailytysaika(365)
            .build())
          val viestit = getViestit(releaseSetsForUsers, luoLahetysResponse.getLahetysTunniste)

          logger.info(s"Sending ${viestit.size} unique emails")
          val result = viestit.map { viesti =>
            logger.info(s"Sending email to ${viesti.getVastaanottajat.get.size} recipients")
            viestinvalitysClient.luoViesti(viesti)
          }
          logger.info(s"Finished sending emails")
          addEmailEvents(releases, eventType)
          result
        } catch {
          case e: BuilderException =>
            logger.warn("Failed to build emails, errors: " + e.getVirheet.asScala.mkString(", "))
            Seq.empty
          case e: ViestinvalitysClientException =>
            logger.warn("Failed to send emails, errors: " + e.getVirheet.asScala.mkString(", "))
            Seq.empty
        }
      }
    } else {
      logger.warn(s"Was going to send emails for ${releases.size} releases, but email-sending has been disabled by env parameter (virkailijan_tyopoyta_emails_disabled = true). Nothing was sent.")
      Seq.empty
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
              contactInfos.flatMap {
                  _.yhteystietoArvo match {
                    case None =>
                      logger.warn(s"userInfo with oid ${userInfo.oidHenkilo} has yhteystieto with null email in yhteystieto ${contactInfos}")
                      None
                    case Some(email) =>
                      val kieliKoodi = userInfo.asiointiKieli.map(_.kieliKoodi).getOrElse("fi")
                      Some(BasicUserInformation(userInfo.oidHenkilo, email, Seq(kieliKoodi)))
                  }
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

  private def getLanguage(basicUserInformation: BasicUserInformation): String = {
    basicUserInformation.languages.headOption.getOrElse("fi") // Defaults to fi if no language is found
  }

  case class ReleaseSet(language: String, ids: Set[Long])

  private def getViestit(releaseSetsForUsers: Seq[(BasicUserInformation, Set[Release])], lahetysTunniste: UUID): Seq[Viesti]  = {
    val releasesById = releaseSetsForUsers.map{case (user, releases) => releases}.flatten.map(r => r.id -> r).toMap
    val recipientsByLocalizedReleaseSet = releaseSetsForUsers
      .map{case (user, releases) => (user.email, ReleaseSet(getLanguage(user), releases.map(r => r.id)))}
      .groupBy(setsPerRecipient => setsPerRecipient._2)
      .map(setsPerSet => setsPerSet._1 -> setsPerSet._2.map(r => r._1).toSet)

    val viestit = recipientsByLocalizedReleaseSet.map{ case (releaseSet, recipients) => {
      val releases = releaseSet.ids.map(id => releasesById.get(id).get)

      recipients
        .grouped(2048)
        .map(recipients => Viesti.builder()
          .withOtsikko(getSubject(releases, releaseSet.language))
          .withHtmlSisalto(EmailHtmlService.htmlString(releases, releaseSet.language))
          .withKielet(releaseSet.language)
          .withVastaanottajat(recipients.foldLeft(Vastaanottajat.builder)((builder, recipient) =>
            builder.withVastaanottaja(Optional.empty.asInstanceOf[Optional[String]], recipient)).build())
          .withLahetysTunniste(lahetysTunniste.toString)
          .build())
    }}.flatten.toSeq

    viestit
  }

  private def getSubject(releases: Set[Release], language: String): String = {
    val translationsMap = EmailTranslations.translation(language)
    val contentHeader = translationsMap.getOrElse(EmailTranslations.EmailHeader, EmailTranslations.defaultEmailHeader)
    val contentBetween = translationsMap.getOrElse(EmailTranslations.EmailContentBetween, EmailTranslations.defaultEmailContentBetween)
    val dates = releases.flatMap(_.notification.map(_.publishDate))
    val (minDate, maxDate) = (dates.min, dates.max)
    val subjectDateString =
      if (minDate == maxDate) s"${minDate.format(dateTimeFormat)}"
      else s"$contentBetween ${minDate.format(dateTimeFormat)} - ${maxDate.format(dateTimeFormat)}"
    s"$contentHeader $subjectDateString"
  }

  private def addEmailEvents(releases: Seq[Release], eventType: EmailEventType)(implicit au: AuditUser): Seq[EmailEvent] = {
    def releaseToEmailEvent(release: Release) = EmailEvent(0l, java.time.LocalDate.now(), release.id, eventType.description)

    logger.info(s"Adding ${releases.length} email events of type '${eventType.description}' to database")
    val emailEvents = releases.map(releaseToEmailEvent)
    emailEvents.flatMap(emailRepository.addEvent(_))
  }
}
