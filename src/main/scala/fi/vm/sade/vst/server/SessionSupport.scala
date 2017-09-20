package fi.vm.sade.vst.server

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directive1, Directives}
import com.softwaremill.session.SessionDirectives._
import com.softwaremill.session.SessionOptions._
import com.softwaremill.session._
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model.User
import fi.vm.sade.vst.security.UserService

import scala.concurrent.ExecutionContext.Implicits.global

/**
  * Created by mty on 26/04/2017.
  */
trait SessionSupport extends Directives with Configuration {

  val userService: UserService

  implicit val sessionManager = new SessionManager[String](sessionConfig)

  implicit val refreshTokenStorage = new InMemoryRefreshTokenStorage[String] {
    override def log(msg: String): Unit = ()
  }

  def extractTicketOption: Directive1[Option[String]] = {
    extractRequest.map { request =>
      request.uri.query().get("ticket")
    }
  }

  def withSession: Directive1[Option[User]] = {
    requiredSession(refreshable, usingCookies). map {
      uid =>
        userService.findUser(uid).toOption
    }
  }

  def withUserOrUnauthorized: Directive1[User] = {
    withSession.flatMap {
      case Some(user) =>
        provide(user)
      case None =>
        complete(StatusCodes.Unauthorized)
    }
  }

  def withAdminUser: Directive1[User] = {
    withUserOrUnauthorized.flatMap {
      case user if user.isAdmin => provide(user)
      case _ => complete(StatusCodes.Unauthorized)
    }
  }
}
