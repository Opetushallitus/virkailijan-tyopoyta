package fi.vm.sade.vst.server

import akka.http.javadsl.model
import akka.http.scaladsl.model.{HttpRequest, StatusCodes}
import akka.http.scaladsl.server._
import com.softwaremill.session.SessionDirectives.{invalidateSession, optionalSession}
import com.softwaremill.session.SessionManager
import com.softwaremill.session.SessionOptions.{oneOff, usingCookies}
import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.javautils.http.HttpServletRequestUtils
import fi.vm.sade.javautils.nio.cas.UserDetails
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model.User
import fi.vm.sade.vst.security.UserService
import org.ietf.jgss.Oid

import java.net.InetAddress
import java.util.Optional

trait SessionSupport extends Directives with Configuration with LazyLogging {

  val userService: UserService

  implicit val sessionManager: SessionManager[String] = new SessionManager[String](sessionConfig)

  def extractTicketOption: Directive1[Option[String]] = {
    extractRequest.map { request =>
      request.uri.query().get("ticket")
    }
  }

  def withSession: Directive1[Option[User]] = {
    optionalSession(oneOff, usingCookies).map {
      case Some(ticket) =>
        logger.info(s"withSession found ticket, attempting to find user")
        userService.findUserForTicket(ticket)
      case None =>
        logger.info(s"withSession found no ticket set")
        None
    }
  }

  def withUserOrUnauthorized: Directive1[User] = {
    optionalSession(oneOff, usingCookies).flatMap {
      case Some(ticket) =>
        getUserDetailsForTicket(ticket) match {
          case Some(uid) =>
            provide(userService.findUser(uid))
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

  protected def getUserDetailsForTicket(ticket: String): Option[UserDetails] = {
    userService.getUserDetailsForTicket(ticket)
  }

  protected def storeTicket(ticket: String, userDetails: UserDetails): Unit = {
    userService.storeTicket(ticket, userDetails)
  }

  def removeTicket(ticket: String): Unit = {
    val oid = userService.getUserDetailsForTicket(ticket).map(_.getHenkiloOid).getOrElse("not found in ticketmap")
    logger.info(s"Removing sessions for ticket: $ticket belonging to user oid: $oid")

    invalidateSession(oneOff, usingCookies)

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
