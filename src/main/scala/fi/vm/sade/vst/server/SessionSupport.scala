package fi.vm.sade.vst.server

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directive1, Directives}
import com.softwaremill.session.SessionDirectives._
import com.softwaremill.session.SessionOptions._
import com.softwaremill.session._
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model.User
import fi.vm.sade.vst.security.UserService

import scala.collection.mutable
import scala.concurrent.ExecutionContext.Implicits.global

/**
  * Created by mty on 26/04/2017.
  */
trait SessionSupport extends Directives with Configuration {

  val userService: UserService

  private val ticketUserMap = mutable.Map[String, String]()

  implicit val sessionManager = new SessionManager[String](sessionConfig)

  implicit val refreshTokenStorage = new InMemoryRefreshTokenStorage[String] {
    override def log(msg: String): Unit = ()

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
        findUserForTicket(ticket)
      case None =>
        None
    }
  }

  def withUserOrUnauthorized: Directive1[User] = {
    optionalSession(refreshable, usingCookies).flatMap {
      case Some(ticket) =>
        ticketUserMap.get(ticket) match {
          case Some(uid) =>
            userService.findUser(uid).toOption match {
              case Some(user) =>
                provide(user)
              case None =>
                complete(StatusCodes.Unauthorized, s"No user found for user id $uid")
            }
          case None =>
            complete(StatusCodes.Unauthorized, s"No user id found for ticket $ticket")
        }
      case None =>
        complete(StatusCodes.Unauthorized, "No session found")
    }
  }

  def withAdminUser: Directive1[User] = {
    withUserOrUnauthorized.flatMap {
      case user if user.isAdmin =>
        provide(user)
      case _ =>
        complete(StatusCodes.Unauthorized, "User not found or not an admin")
    }
  }

  protected def storeTicket(ticket: String, uid: String): Unit = {
    ticketUserMap.update(ticket, uid)
  }

  protected def findUserForTicket(ticket: String): Option[User] = {
    val uidOpt: Option[String] = ticketUserMap.get(ticket)
    uidOpt.flatMap(userService.findUser(_).toOption)
  }

  def removeTicket(ticket: String): Unit = {
    refreshTokenStorage.removeForTicket(ticket)
    refreshTokenManager.removeToken(ticket)
    ticketUserMap.remove(ticket)
  }
}
