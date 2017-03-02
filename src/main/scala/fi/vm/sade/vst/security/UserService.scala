package fi.vm.sade.vst.security

import fi.vm.sade.security.ldap.{LdapClient, LdapUser}
import fi.vm.sade.vst.AuthenticationConfig
import fi.vm.sade.vst.model.User
import java.net.URLEncoder

import scala.util.{Failure, Success, Try}
import scalacache._
import memoization._
import guava._
import concurrent.duration._
import language.postfixOps

class UserService(val casUtils: CasUtils,
                  val ldapClient: LdapClient,
                  val kayttooikeusService: KayttooikeusService,
                  val config: AuthenticationConfig) {

  implicit val scalaCache = ScalaCache(GuavaCache())

  private lazy val servicePart = URLEncoder.encode(s"${config.serviceId}/authenticate", "UTF-8")

  lazy val loginUrl =s"${config.casUrl}/login?service=$servicePart"

  private def createUser(ldapUser: LdapUser): User = {
    val groups = kayttooikeusService.fetchRightsForUser(ldapUser.oid)
    User(ldapUser.lastName, "", "fi", false, groups)
  }

  def findUser(uid: String ): Try[User] = memoizeSync(10 minutes) {
    ldapClient.findUser(uid) match {
      case Some(ldapUser) => Success(createUser(ldapUser))
      case None => Failure(new IllegalStateException(s"User $uid not found in LDAP"))
    }
  }

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

  def uid(ticket: String): String = {
    val uid =casUtils.validateTicket(ticket).recoverWith({
      case t => Failure(new IllegalArgumentException(s"Cas ticket $ticket rejected", t))
    })
    uid.toString
  }
}
