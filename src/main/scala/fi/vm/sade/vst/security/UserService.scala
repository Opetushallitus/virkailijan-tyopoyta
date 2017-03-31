package fi.vm.sade.vst.security

import fi.vm.sade.security.ldap.{LdapClient, LdapUser}
import fi.vm.sade.vst.AuthenticationConfig
import fi.vm.sade.vst.model.{User, UserProfile, UserProfileUpdate}
import java.net.URLEncoder

import fi.vm.sade.vst.repository.UserRepository

import scala.util.{Failure, Success, Try}
import scalacache._
import memoization._
import guava._
import concurrent.duration._
import language.postfixOps

class UserService(val casUtils: CasUtils,
                  val ldapClient: LdapClient,
                  val kayttooikeusService: KayttooikeusService,
                  val userRepository: UserRepository,
                  val config: AuthenticationConfig) {

  implicit val scalaCache = ScalaCache(GuavaCache())

  private lazy val servicePart = URLEncoder.encode(s"${config.serviceId}/authenticate", "UTF-8")

  lazy val loginUrl =s"${config.casUrl}/login?service=$servicePart"

  val adminRole = "APP_VIRKAILIJANTYOPOYTA_CRUD_1.2.246.562.10.00000000001"

  private def createUser(ldapUser: LdapUser): User = {
    val groups = kayttooikeusService.userGroupsForUser(ldapUser.roles)
    //TODO: Do not memoize userprofile (firstLogin)
    val profile = userRepository.userProfile(ldapUser.oid)
    val lang = ldapUser.roles.find(r => r.startsWith("LANG_")).map(_.substring(5))
    val isAdmin = ldapUser.roles.contains(adminRole)
    User(ldapUser.oid, ldapUser.lastName, "", lang.getOrElse("fi"), isAdmin, groups, ldapUser.roles, profile)
  }

  def findUser(uid: String ): Try[User] = memoizeSync(10 minutes) {
    ldapClient.findUser(uid) match {
      case Some(ldapUser) => Success(createUser(ldapUser))
      case None => Failure(new IllegalStateException(s"User $uid not found in LDAP"))
    }
  }

  def setUserProfile(oid: String, userProfile: UserProfileUpdate) = userRepository.setUserProfile(oid,userProfile)

  def userProfile(oid: String) = userRepository.userProfile(oid)

  def serviceUserGroups = kayttooikeusService.appGroups

  def saveDraft(user: User, draft: String) = userRepository.saveDraft(user, draft)

  def authenticate(ticket: String): Option[(String, User)] = {

    val uid = casUtils.validateTicket(ticket)

    val user = uid.flatMap(findUser)

    (uid, user) match {
      case (Success(id), Success(u)) => Some(id, u)
      case (_, Failure(t)) =>
        println(t.getMessage)
        None
      case _ => None
    }
  }
}
