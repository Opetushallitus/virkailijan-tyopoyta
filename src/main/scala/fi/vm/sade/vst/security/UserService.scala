package fi.vm.sade.vst.security

import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.model._
import fi.vm.sade.vst.repository.{ReleaseRepository, UserRepository}
import fi.vm.sade.vst.Configuration
import play.api.libs.json._
import java.util.concurrent.ConcurrentHashMap

import fi.vm.sade.utils.kayttooikeus.{KayttooikeusUserDetails, KayttooikeusUserDetailsService}

import scala.collection.convert.decorateAsScala._
import scala.collection.mutable
import scala.language.postfixOps
import scala.util.{Failure, Success, Try}
import scalacache.ScalaCache
import scalacache.guava.GuavaCache
import scalacache.memoization._

class UserService(casUtils: CasUtils,
                  userDetailsService: KayttooikeusUserDetailsService,
                  kayttooikeusService: KayttooikeusService,
                  userRepository: UserRepository,
                  releaseRepository: ReleaseRepository)
  extends Configuration with LazyLogging {

  implicit val scalaCache = ScalaCache(GuavaCache())

  private lazy val servicePart = s"${authenticationConfig.serviceId}/authenticate"

  lazy val loginUrl: String = urls.url("cas.login", servicePart)

  val adminRole = "APP_VIRKAILIJANTYOPOYTA_CRUD_1.2.246.562.10.00000000001"

  private val ticketUserMap: mutable.Map[String, String] = new ConcurrentHashMap[String, String]().asScala

  private def oppijanumeroRekisteri = {
    casUtils.serviceClient(oppijanumeroRekisteriConfig.serviceAddress)
  }

  private def userInitialsAndLang(userOid: String): (Option[String], Option[String]) = {
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

  private def createUser(koUser: KayttooikeusUserDetails): User = {
    val isAdmin = koUser.roles.contains(adminRole)
    val groups = kayttooikeusService.userGroupsForUser(koUser.oid, isAdmin)

    val (initials, langOpt) = userInitialsAndLang(koUser.oid)
    val initialsToShow = if (isAdmin) {
      initials
    } else None
    val user = User(koUser.oid, initialsToShow, langOpt.getOrElse("fi"), isAdmin, groups, koUser.roles)
    user.copy(allowedCategories = releaseRepository.categories(user).map(_.id))
  }

  private def fetchCacheableUserData(uid: String): Try[User] = {
    memoizeSync(authenticationConfig.memoizeDuration) {
      userDetailsService.getUserByUsername(uid, "virkailijan-tyopoyta", urls) match {
        case Right(koUser) =>
          Success(createUser(koUser))
        case Left(error) =>
          logger.error(s"User $uid role query error", error)
          Failure(new IllegalStateException(s"User $uid role query error"))
      }
    }
  }

  def findUser(uid: String): Try[User] = {
    val user = fetchCacheableUserData(uid)

    user match {
      case Success(u) =>
        Success(u.copy(
          profile = Some(userRepository.userProfile(u.userId)),
          draft = userRepository.fetchDraft(u.userId)))
      case Failure(e) =>
        logger.debug(s"User call failed for uid $uid : ${e.getMessage}")
        user
    }
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

  def validateTicket(ticket: String): Try[String] = {
    casUtils.validateTicket(ticket)
  }

  def authenticate(ticket: String): Option[(String, User)] = {
    val uid = casUtils.validateTicket(ticket)
    val user = uid.flatMap(findUser)

    (uid, user) match {
      case (Success(id), Success(u)) =>
        Some(id, u)
      case (Failure(e), _) =>
        logger.error(s"Ticket validation failed", e)
        None
      case (Success(u), Failure(t)) =>
        logger.error(s"Failed to find user data for $u", t)
        None
      case _ =>
        None
    }
  }

  def getUserIdForTicket(ticket: String): Option[String] = {
    ticketUserMap.get(ticket)
  }

  def findUserForTicket(ticket: String): Option[User] = {
    getUserIdForTicket(ticket).flatMap(uid => findUser(uid).toOption)
  }

  def storeTicket(ticket: String, userId: String): Unit = {
    ticketUserMap.update(ticket, userId)
  }

  def removeTicket(ticket: String): Unit = {
    ticketUserMap.remove(ticket) match {
      case Some(user) =>
        logger.info(s"Removed ticket $ticket for user $user")
        val usersOtherTickets = ticketUserMap.filter(_._2 == user).keys
        if (usersOtherTickets.nonEmpty) {
          logger.warn(s"User $user still has the following tickets active: ${usersOtherTickets.mkString(" ")}")
        }
      case None =>
        throw new NoSuchElementException(s"Tried to remove ticket but no such ticket found: $ticket")
    }
  }

}
