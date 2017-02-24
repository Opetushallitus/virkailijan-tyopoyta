package fi.vm.sade.vst.security

import fi.vm.sade.security.ldap.{LdapClient, LdapUser}
import fi.vm.sade.utils.cas.CasClient
import fi.vm.sade.utils.cas.CasClient.{ServiceTicket, Username}
import fi.vm.sade.vst.AuthenticationConfig
import fi.vm.sade.vst.model.User
import java.net.URLEncoder

import scala.util.{Failure, Success, Try}
import scalaz.concurrent.Task
import scalacache._
import memoization._
import guava._
import concurrent.duration._
import language.postfixOps

class AuthenticationService(val casClient: CasClient,
                            val ldapClient: LdapClient,
                            val config: AuthenticationConfig)  {

  implicit val scalaCache = ScalaCache(GuavaCache())

  val validateTicket: (ServiceTicket) => Task[Username] = casClient.validateServiceTicket(config.serviceId)

  private lazy val servicePart = URLEncoder.encode(s"${config.serviceId}/authenticate", "UTF-8")

  lazy val loginUrl =s"${config.casUrl}/login?service=$servicePart"


  private def createUser(ldapUser: LdapUser): User = User(ldapUser.lastName, "fi", ldapUser.roles)

  def findUser(uid: String ): Try[User] = memoizeSync(10 minutes) {
    ldapClient.findUser(uid) match {
      case Some(ldapUser) => Success(createUser(ldapUser))
      case None => Failure(new IllegalStateException(s"User $uid not found in LDAP"))
    }
  }

  def authenticate(ticket: String): Option[(String, User)] = {

    val uid = Try(validateTicket(ticket).unsafePerformSync).recoverWith({
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
