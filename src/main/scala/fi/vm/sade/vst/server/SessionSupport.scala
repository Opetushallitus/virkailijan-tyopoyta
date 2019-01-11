package fi.vm.sade.vst.server

import java.net.InetAddress
import java.util.Optional

import akka.http.javadsl.model
import akka.http.scaladsl.model.{HttpRequest, StatusCodes}
import akka.http.scaladsl.server._
import com.softwaremill.session.SessionDirectives._
import com.softwaremill.session.SessionOptions._
import com.softwaremill.session._
import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.javautils.http.HttpServletRequestUtils
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model.User
import fi.vm.sade.vst.security.UserService
import org.ietf.jgss.Oid

import scala.concurrent.ExecutionContext.Implicits.global

/**
  * Created by mty on 26/04/2017.
  */
trait SessionSupport extends Directives with Configuration with LazyLogging {

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
                logger.info(s"withUserOrUnauthorized failed: found user id $uid for sessionticket $ticket but no user data for id")
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
    logger.info(s"Removing sessions for ticket: $ticket belonging to user oid: ${userService.getUserIdForTicket(ticket).getOrElse("not found in ticketmap")}")
    
    invalidateSession(refreshable, usingCookies)
    refreshTokenStorage.removeForTicket(ticket)
    refreshTokenManager.removeToken(ticket)

    userService.removeTicket(ticket)
  }
}


trait AuditSupport extends Directives {
  def withAuditUser(user: User): Directive1[AuditUser] = {
    extractRequest.flatMap {
      httpRequest: HttpRequest =>
        cookie("virkailijan-tyopoyta-session").flatMap {
          sessionCookie =>
            headerValueByName("User-Agent").map {
              userAgent => {
                val oid = new Oid(user.userId)
                val xRealIp = emptyHeaderValueIfEmpty(httpRequest, "X-Real-IP")
                val xForwardedFor = emptyHeaderValueIfEmpty(httpRequest, "X-Forwarded-For")
                val remoteAddress = emptyHeaderValueIfEmpty(httpRequest, "Remote-Address")
                val inetAddress = InetAddress.getByName(HttpServletRequestUtils.getRemoteAddress(xRealIp, xForwardedFor, remoteAddress, httpRequest.uri.toString()))
                val session: String = sessionCookie.value
                new AuditUser(oid, inetAddress, session, userAgent)
              }
            }
        }
    }
  }

  private def emptyHeaderValueIfEmpty(httpRequest: HttpRequest, headerName: String): String = {
    val header: Optional[model.HttpHeader] = httpRequest.getHeader(headerName)
    if (header.isPresent) {
      header.get.value
    } else {
      ""
    }
  }
}
