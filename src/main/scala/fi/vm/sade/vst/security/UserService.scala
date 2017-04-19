package fi.vm.sade.vst.security

import concurrent.duration._
import fi.vm.sade.security.ldap.{LdapClient, LdapUser}
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model._
import fi.vm.sade.vst.repository.{ReleaseRepository, UserRepository}
import java.net.URLEncoder
import language.postfixOps
import scalacache.guava.GuavaCache
import scalacache.memoization._
import scalacache.ScalaCache
import scala.util.{Failure, Success, Try}
import play.api.libs.json._

class UserService(casUtils: CasUtils,
                  ldapClient: LdapClient,
                  kayttooikeusService: KayttooikeusService,
                  userRepository: UserRepository,
                  releaseRepository: ReleaseRepository)
  extends Configuration {

  implicit val scalaCache = ScalaCache(GuavaCache())

  private lazy val servicePart = URLEncoder.encode(s"${authenticationConfig.serviceId}/authenticate", "UTF-8")

  lazy val loginUrl =s"${authenticationConfig.casUrl}/login?service=$servicePart"

  val adminRole = "APP_VIRKAILIJANTYOPOYTA_CRUD_1.2.246.562.10.00000000001"

  private def oppijanumeroRekisteri = casUtils.serviceClient(oppijanumeroRekisteriConfig.serviceAddress)

  private def userInitials(userOid: String): Option[String] = {
    val json = s"""["$userOid"]"""
    val body = Option(json)
    val response = oppijanumeroRekisteri.authenticatedRequest(s"${oppijanumeroRekisteriConfig.serviceAddress}/henkilo/henkiloPerustietosByHenkiloOidList", RequestMethod.POST, mediaType = Option(org.http4s.MediaType.`application/json`), body = body)
    response match {
      case Success(s) => parseUserInitialsFromResponse(s)
      case Failure(f) => None
    }
  }

  private def parseUserInitialsFromResponse(response: String): Option[String] = {
    val json = Json.parse(response).asOpt[JsArray].map(_.value).getOrElse(Seq.empty)
    val callingNames = json.map { value =>
      val callingName = (value \ "kutsumanimi").as[String].take(1).toUpperCase
      val lastName = (value \ "sukunimi").as[String].take(1).toUpperCase
      s"$callingName$lastName"
    }
    callingNames.headOption
  }

  private def createUser(ldapUser: LdapUser): User = {
    val lang = ldapUser.roles.find(r => r.startsWith("LANG_")).map(_.substring(5))
    val isAdmin = ldapUser.roles.contains(adminRole)
    val groups = kayttooikeusService.userGroupsForUser(ldapUser.oid, isAdmin)
    val initials = if (isAdmin) userInitials(ldapUser.oid) else None

    val user = User(ldapUser.oid, ldapUser.lastName, ldapUser.givenNames, initials, lang.getOrElse("fi"), isAdmin, groups, ldapUser.roles)
    user.copy(allowedCategories = releaseRepository.categories(user).map(_.id))
  }

  private def fetchCacheableUserData(uid: String): Try[User] = memoizeSync(10 minutes) {
    ldapClient.findUser(uid) match {
      case Some(ldapUser) => {
        println("Found user from LDAP")
        Success(createUser(ldapUser))
      }
      case None => Failure(new IllegalStateException(s"User $uid not found in LDAP"))
    }
  }

  def findUser(uid: String ): Try[User] = {
    val user = fetchCacheableUserData(uid)

    user match{
      case Success(u) => {
        Success(u.copy(
          profile = Some(userRepository.userProfile(u.userId)),
          draft = userRepository.fetchDraft(u.userId)))
      }
      case Failure(e) => {
        println(s"LDAP call failed for uid $uid : ${e.getMessage}")
        user
      }
    }
  }

  def setUserProfile(user: User, userProfile: UserProfileUpdate): UserProfile = userRepository.setUserProfile(user, userProfile)

  def userProfile(oid: String): UserProfile = userRepository.userProfile(oid)

  def userProfiles(oids: Seq[String]): List[UserProfile] = userRepository.userProfiles(oids)

  def serviceUserGroups: Seq[Kayttooikeusryhma] = kayttooikeusService.appGroups

  def saveDraft(user: User, draft: String): Int = userRepository.saveDraft(user, draft)

  def targetingGroups(user: User) = userRepository.findTargetingGroups(user)

  def saveTargetingGroup(user: User, name: String, data: String): Option[TargetingGroup] = userRepository.saveTargetingGroup(user, name, data)

  def deleteTargetingGroup(user: User, id: Long) = userRepository.deleteTargetingGroup(user, id)

  def deleteDraft(user: User): Int = userRepository.deleteDraft(user)

  def authenticate(ticket: String): Option[(String, User)] = {

    val uid = casUtils.validateTicket(ticket)
    val user = uid.flatMap(findUser)

    (uid, user) match {
      case (Success(id), Success(u)) => Some(id, u)
      case (Failure(e), _) => {
        println(s"Failed to authenticate ticket: ${e.getMessage}")
        None
      }
      case (Success(u), Failure(t)) =>
        println(s"Failed to find user $u : ${t.getMessage}")
        None
      case _ => None
    }
  }
}
