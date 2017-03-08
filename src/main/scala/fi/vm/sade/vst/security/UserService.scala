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

  private def createUser(uid: String, ldapUser: LdapUser): User = {
    val groups = kayttooikeusService.fetchRightsForUser(ldapUser.oid)
    val profile = userRepository.userProfile(uid)

    val lang = ldapUser.roles.find(r => r.startsWith("LANG_")).map(_.substring(5))
    User(ldapUser.lastName, "", lang.getOrElse("fi"), true, groups, profile)
  }

  def findUser(uid: String ): Try[User] = memoizeSync(10 minutes) {
    ldapClient.findUser(uid) match {
      case Some(ldapUser) => Success(createUser(uid, ldapUser))
      case None => Failure(new IllegalStateException(s"User $uid not found in LDAP"))
    }
  }

  def setUserProfile(uid:String, userProfile: UserProfileUpdate) = userRepository.setUserProfile(uid,userProfile)

  def userProfile(uid: String) = userRepository.userProfile(uid)

  def serviceUserGroups = kayttooikeusService.appGroups

  def authenticate(ticket: String): Option[(String, User)] = {

    val uid = casUtils.validateTicket(ticket).recoverWith({
      case t => Failure(new IllegalArgumentException(s"Cas ticket $ticket rejected", t))
    })

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
