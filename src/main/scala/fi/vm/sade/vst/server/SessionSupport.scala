package fi.vm.sade.vst.server

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directive1, Directives}
import com.softwaremill.session.SessionDirectives._
import com.softwaremill.session.SessionOptions._
import com.softwaremill.session._
import fi.vm.sade.vst.{Configuration, Logging}
import fi.vm.sade.vst.model.User
import fi.vm.sade.vst.security.UserService

import scala.concurrent.ExecutionContext.Implicits.global

/**
  * Created by mty on 26/04/2017.
  */
trait SessionSupport extends Directives with Configuration with Logging {

  val userService: UserService

  implicit val sessionManager = new SessionManager[String](sessionConfig)

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

  val refreshTokenManager = sessionManager.createRefreshTokenManager(refreshTokenStorage)

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

  protected def findUserForTicket(ticket: String): Option[User] = {
    val uidOpt: Option[String] = getUserIdForTicket(ticket)
    uidOpt.flatMap(userService.findUser(_).toOption)
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
