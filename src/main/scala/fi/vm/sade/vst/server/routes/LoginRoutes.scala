package fi.vm.sade.vst.server.routes

import javax.ws.rs.Path

import fi.vm.sade.utils.cas.CasLogout
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Route
import com.softwaremill.session.SessionDirectives.{invalidateSession, optionalSession, setSession}
import com.softwaremill.session.SessionOptions.{refreshable, usingCookies}
import fi.vm.sade.vst.model.{JsonSupport, User}
import fi.vm.sade.vst.security.UserService
import fi.vm.sade.vst.server.{ResponseUtils, SessionSupport}
import io.swagger.annotations._

import scala.concurrent.ExecutionContext.Implicits.global


@Api(value = "Kirjautumiseen liittyvät rajapinnat", produces = "application/json")
@Path("")
class LoginRoutes(val userService: UserService) extends SessionSupport with JsonSupport with ResponseUtils {

  private val serviceRoot: String = "/virkailijan-tyopoyta/"

  private def authenticateUser(ticket: String): Route = {
    userService.authenticate(ticket) match {
      case Some((uid, user)) =>
        setSession(refreshable, usingCookies, ticket) {
          storeTicket(ticket, uid)
          redirect(serviceRoot, StatusCodes.Found)
        }
      case None =>
        complete(StatusCodes.Unauthorized)
    }
  }

  @ApiOperation(value = "Käyttäjän kirjautuminen", httpMethod = "GET")
  @Path("/login")
  @ApiResponses(Array(
    new ApiResponse(code = 302, message = "Uudelleenohjaus CASsille, service-parametrina /authenticate endpoint"),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def loginRoute: Route = path("login") {
    get {
      optionalSession(refreshable, usingCookies) {
        case Some(_) =>
          invalidateSession(refreshable, usingCookies)
          redirect(userService.loginUrl, StatusCodes.Found)
        case None =>
          redirect(userService.loginUrl, StatusCodes.Found)
      }
    }
  }

  @ApiOperation(value = "Käyttäjän autentikointi", httpMethod = "GET",
    notes = "Validoi CAS ticketin, hakee käyttäjän tiedot ja luo session")
  @Path("/authenticate")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "ticket", required = true, dataType = "string", paramType = "query", value = "CASsin service ticket")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Autentikoidun käyttäjän tiedot", response = classOf[User]),
    new ApiResponse(code = 401, message = "Tickettiä ei ole tai sitä ei pystytä validoimaan")))
  def authenticationRoute: Route = path("authenticate") {
    get {
      extractTicketOption {
        case Some(t) =>
          authenticateUser(t)
        case None =>
          complete(StatusCodes.Unauthorized)
      }
    }
  }

  @ApiOperation(value = "CAS backchannel logout", httpMethod = "POST")
  @Path("/authenticate")
  @ApiResponses(Array(
    new ApiResponse(code = 302, message = "")))
  def casRoute: Route = path("authenticate") {
    post {
      extractRequest { request =>
        val param = request.uri.query().get("logoutRequest").getOrElse(throw new RuntimeException("Required parameter logoutRequest not found"))
        val ticket = CasLogout.parseTicketFromLogoutRequest(param).getOrElse(throw new RuntimeException(s"Could not parse ticket from $param"))
        removeTicket(ticket)
        redirect(userService.loginUrl, StatusCodes.Found)
      }
    }
  }

  @ApiOperation(value = "manual logout", httpMethod = "GET")
  @Path("/logout")
  @ApiResponses(Array(
    new ApiResponse(code = 302, message = "")))
  def logoutRoute: Route = path("logout") {
    get {
      optionalSession(refreshable, usingCookies) { ticketOpt =>
        ticketOpt.foreach(removeTicket)
        redirect(userService.loginUrl, StatusCodes.Found)
      }
    }
  }


  val routes: Route = loginRoute ~ authenticationRoute ~ casRoute ~ logoutRoute
}

