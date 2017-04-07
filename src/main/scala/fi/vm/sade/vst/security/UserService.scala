package fi.vm.sade.vst.security

import concurrent.duration._
import fi.vm.sade.security.ldap.{LdapClient, LdapUser}
import fi.vm.sade.vst.AuthenticationConfig
import fi.vm.sade.vst.model.{Kayttooikeusryhma, User, UserProfile, UserProfileUpdate}
import fi.vm.sade.vst.repository.{ReleaseRepository, UserRepository}
import java.net.URLEncoder

import language.postfixOps
import scalacache.ScalaCache
import scalacache.guava.GuavaCache
import scalacache.memoization._
import scala.util.{Failure, Success, Try}

class UserService(casUtils: CasUtils,
                  ldapClient: LdapClient,
                  kayttooikeusService: KayttooikeusService,
                  userRepository: UserRepository,
                  releaseRepository: ReleaseRepository,
                  config: AuthenticationConfig) {

  implicit val scalaCache = ScalaCache(GuavaCache())

  private lazy val servicePart = URLEncoder.encode(s"${config.serviceId}/authenticate", "UTF-8")

  lazy val loginUrl =s"${config.casUrl}/login?service=$servicePart"

  val adminRole = "APP_VIRKAILIJANTYOPOYTA_CRUD_1.2.246.562.10.00000000001"

  private def createUser(ldapUser: LdapUser): User = {
    val lang = ldapUser.roles.find(r => r.startsWith("LANG_")).map(_.substring(5))
    val isAdmin = ldapUser.roles.contains(adminRole)
    val groups = kayttooikeusService.userGroupsForUser(ldapUser.oid, isAdmin)

    val user = User(ldapUser.oid, ldapUser.lastName, ldapUser.givenNames, lang.getOrElse("fi"), isAdmin, groups, ldapUser.roles)
    user.copy(allowedCategories = releaseRepository.categories(user).map(_.id))
  }

  private def fetchCacheableUserData(uid: String): Try[User] = memoizeSync(10 minutes) {
    ldapClient.findUser(uid) match {
      case Some(ldapUser) => Success(createUser(ldapUser))
      case None => Failure(new IllegalStateException(s"User $uid not found in LDAP"))
    }
  }

  def findUser(uid: String ): Try[User] = {
    val user = fetchCacheableUserData(uid)
    user.map(u => u.copy(profile = Some(userRepository.userProfile(u.userId))))
  }

  def setUserProfile(user: User, userProfile: UserProfileUpdate): UserProfile = userRepository.setUserProfile(user, userProfile)

  def userProfile(oid: String): UserProfile = userRepository.userProfile(oid)

  def userProfiles(oids: Seq[String]): List[UserProfile] = userRepository.userProfiles(oids)

  def serviceUserGroups: Seq[Kayttooikeusryhma] = kayttooikeusService.appGroups

  def saveDraft(user: User, draft: String): Unit = userRepository.saveDraft(user, draft)

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
