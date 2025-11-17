package fi.vm.sade.vst.security

import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.javautils.nio.cas.UserDetails
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model._
import fi.vm.sade.vst.repository.{ReleaseRepository, UserRepository}
import play.api.libs.json._
import scalacache.ScalaCache
import scalacache.guava.GuavaCache
import scalacache.memoization._
import scalacache.serialization.InMemoryRepr

import java.util.concurrent.ConcurrentHashMap
import scala.collection.convert.decorateAsScala._
import scala.collection.mutable
import scala.language.postfixOps
import scala.util.{Failure, Success, Try}

class UserService(casUtils: CasUtils,
                  kayttooikeusService: KayttooikeusService,
                  userRepository: UserRepository,
                  releaseRepository: ReleaseRepository)
  extends Configuration with LazyLogging {

  implicit val scalaCache: ScalaCache[InMemoryRepr] = ScalaCache(GuavaCache())

  private lazy val servicePart = s"${authenticationConfig.serviceId}/authenticate"

  lazy val loginUrl: String = urls.url("cas.login", servicePart)

  private val adminRole = "APP_VIRKAILIJANTYOPOYTA_CRUD_1.2.246.562.10.00000000001"

  private val ticketUserMap: mutable.Map[String, UserDetails] = new ConcurrentHashMap[String, UserDetails]().asScala

  private def oppijanumeroRekisteri = {
    casUtils.serviceClient(oppijanumeroRekisteriConfig.serviceAddress)
  }

  def userInitialsAndLang(userOid: String): (Option[String], Option[String]) = {
    val json = s"""["$userOid"]"""
    val url = s"${oppijanumeroRekisteriConfig.serviceAddress}/henkilo/henkiloPerustietosByHenkiloOidList"
    val response = oppijanumeroRekisteri.authenticatedJsonPost(url, json)
    response match {
      case Success(s) =>
        parseUserInitialsAndLangFromResponse(s)
      case Failure(f) =>
        logger.error(s"Failed to get user initials for user $userOid", f)
        (None, None)
    }
  }

  private def parseUserInitialsAndLangFromResponse(response: String): (Option[String], Option[String]) = {
    val json = Json.parse(response).asOpt[JsArray].map(_.value).getOrElse(Seq.empty)
    val callingNames = json.map { value =>
      val callingName = (value \ "kutsumanimi").as[String].take(1).toUpperCase
      val lastName = (value \ "sukunimi").as[String].take(1).toUpperCase
      s"$callingName$lastName"
    }
    val lang = json.map { value =>
      (value \ "asiointiKieli" \ "kieliKoodi").getOrElse(JsString("fi")).as[String]
    }
    (callingNames.headOption, lang.headOption)
  }

  private def createUser(userDetails: UserDetails): User = {
    val isAdmin = userDetails.getRoles.contains(adminRole)
    val oid = userDetails.getHenkiloOid
    val groups = kayttooikeusService.userGroupsForUser(oid, isAdmin)

    val (initials, langOpt) = userInitialsAndLang(oid)
    val initialsToShow = if (isAdmin) {
      initials
    } else None
    val user = User(oid, initialsToShow, langOpt.getOrElse("fi"), isAdmin, groups, userDetails.getRoles.asScala.toList)
    user.copy(allowedCategories = releaseRepository.categories(user).map(_.id))
  }

  private def fetchCacheableUserData(userDetails: UserDetails): User =
    memoizeSync(authenticationConfig.memoizeDuration) {
      createUser(userDetails)
    }

  def findCachedUser(uid: String): Option[User] = {
    findUserDetailsWithUsername(uid).map(findUser)
  }

  def findUser(userDetails: UserDetails): User = {
    val user = fetchCacheableUserData(userDetails)

    user.copy(
      profile = Some(userRepository.userProfile(user.userId)),
      draft = userRepository.fetchDraft(user.userId))
  }

  def setUserProfile(user: User, userProfile: UserProfileUpdate)(implicit au: AuditUser): UserProfile = {
    userRepository.setUserProfile(user, userProfile)
  }

  def userProfile(oid: String): UserProfile = {
    userRepository.userProfile(oid)
  }

  def userProfiles(oids: Seq[String]): List[UserProfile] = {
    userRepository.userProfiles(oids)
  }

  def serviceUserGroups: Seq[Kayttooikeusryhma] = {
    kayttooikeusService.appGroups
  }

  def saveDraft(user: User, draft: String): Int = {
    userRepository.saveDraft(user, draft)
  }

  def targetingGroups(user: User): Seq[TargetingGroup] = {
    userRepository.findTargetingGroups(user)
  }

  def saveTargetingGroup(user: User, name: String, data: String): Option[TargetingGroup] = {
    userRepository.saveTargetingGroup(user, name, data)
  }

  def deleteTargetingGroup(user: User, id: Long): Int = {
    userRepository.deleteTargetingGroup(user, id)
  }

  def deleteDraft(user: User): Int = {
    userRepository.deleteDraft(user)
  }

  def validateTicket(ticket: String): Try[UserDetails] = {
    casUtils.validateTicket(ticket)
  }

  def getUserDetailsForTicket(ticket: String): Option[UserDetails] = {
    ticketUserMap.get(ticket)
  }

  def findUserForTicket(ticket: String): Option[User] = {
    getUserDetailsForTicket(ticket).map(details => findUser(details))
  }

  def storeTicket(ticket: String, userDetails: UserDetails): Unit = {
    ticketUserMap.update(ticket, userDetails)
  }

  private def findUserDetailsWithUsername(username: String): Option[UserDetails] = {
    ticketUserMap.values.find(_.getUser == username)
  }

  def removeTicket(ticket: String): Unit = {
    ticketUserMap.remove(ticket) match {
      case Some(userDetails) =>
        val username = userDetails.getUser
        logger.info(s"Removed ticket $ticket for user $username")
        val usersOtherTickets = ticketUserMap.filter(_._2.getUser == username).keys
        if (usersOtherTickets.nonEmpty) {
          logger.warn(s"User $username still has the following tickets active: ${usersOtherTickets.mkString(" ")}")
        }
      case None =>
        logger.warn(s"Tried to remove ticket but no such ticket found: $ticket")
    }
  }

}
