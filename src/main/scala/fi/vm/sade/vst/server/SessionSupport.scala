package fi.vm.sade.vst.server

import org.ietf.jgss.Oid
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server._
import com.softwaremill.session.SessionDirectives._
import com.softwaremill.session.SessionOptions._
import com.softwaremill.session._
import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.{Configuration, Logging}
import fi.vm.sade.vst.model.User
import fi.vm.sade.vst.security.UserService

import scala.concurrent.ExecutionContext.Implicits.global

/**
  * Created by mty on 26/04/2017.
  */
trait SessionSupport extends Directives with Configuration with Logging {

  val userService: UserService

  implicit val sessionManager: SessionManager[String] = new SessionManager[String](sessionConfig)

  implicit val refreshTokenStorage = new InMemoryRefreshTokenStorage[String] {
    override def log(msg: String): Unit = logger.info(msg)

    def removeForTicket(ticket: String): Unit = {
      store.foreach { case (selector, storedSession) =>
        if (storedSession.session == ticket) {
          this.remove(selector)
        }
      }
    }
  }

  val refreshTokenManager: RefreshTokenManager[String] = sessionManager.createRefreshTokenManager(refreshTokenStorage)

  def extractTicketOption: Directive1[Option[String]] = {
    extractRequest.map { request =>
      request.uri.query().get("ticket")
    }
  }

  def withSession: Directive1[Option[User]] = {
    optionalSession(refreshable, usingCookies).map {
      case Some(ticket) =>
        logger.info(s"withSession found ticket, attempting to find user")
        userService.findUserForTicket(ticket)
      case None =>
        logger.info(s"withSession found no ticket set")
        None
    }
  }

  def withUserOrUnauthorized: Directive1[User] = {
    optionalSession(refreshable, usingCookies).flatMap {
      case Some(ticket) =>
        getUserIdForTicket(ticket) match {
          case Some(uid) =>
            userService.findUser(uid).toOption match {
              case Some(user) =>
                provide(user)
              case None =>
                logger.info(s"withUserOrUnauthorized failed: found user id for session but no user data for id")
                complete(StatusCodes.Unauthorized, s"No user found for user id $uid")
            }
          case None =>
            logger.info(s"withUserOrUnauthorized failed: no user id found for $ticket")
            complete(StatusCodes.Unauthorized, s"No user id found for ticket $ticket")
        }
      case None =>
        logger.info(s"withUserOrUnauthorized failed: no existing session")
        complete(StatusCodes.Unauthorized, "No session found")
    }
  }

  def withAdminUser: Directive1[User] = {
    withUserOrUnauthorized.flatMap {
      case user if user.isAdmin =>
        provide(user)
      case user =>
        logger.info(s"withAdminUser: ${user.userId} was not an admin")
        complete(StatusCodes.Unauthorized, "User not found or not an admin")
    }
  }



  protected def getUserIdForTicket(ticket: String): Option[String] = {
    userService.getUserIdForTicket(ticket)
  }

  protected def storeTicket(ticket: String, uid: String): Unit = {
    userService.storeTicket(ticket, uid)
  }

  def removeTicket(ticket: String): Unit = {
    logger.info(s"Removing sessions for $ticket")
    refreshTokenStorage.removeForTicket(ticket)
    refreshTokenManager.removeToken(ticket)
    userService.removeTicket(ticket)
  }
}


trait AuditSupport extends Directives {
  def withAuditUser(user: User): Directive1[AuditUser] = {
    extractClientIP.flatMap {
      ip =>
        cookie("virkailijan-tyopoyta-session").flatMap {
          sessionCookie =>
            headerValueByName("User-Agent").map {
              userAgent => {
                val oid = new Oid(user.userId)
                val inetAddress = ip.toOption.get
                val session: String = sessionCookie.value
                new AuditUser(oid, inetAddress, session, userAgent)
              }
            }
        }
    }
  }
}