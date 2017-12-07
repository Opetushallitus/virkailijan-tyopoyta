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
import scala.util.{Success, Failure}


@Api(value = "Kirjautumiseen liittyvät rajapinnat", produces = "application/json")
@Path("")
class LoginRoutes(val userService: UserService) extends SessionSupport with JsonSupport with ResponseUtils {

  private val serviceRoot: String = "/virkailijan-tyopoyta/"

  private def authenticateUser(ticket: String): Route = {
    logger.info("Validating CAS ticket")
    userService.validateTicket(ticket) match {
      case Success(uid) =>
        storeTicket(ticket, uid)
        userService.findUser(uid) match {
          case Success(user) =>
            setSession(refreshable, usingCookies, ticket) {
              logger.info(s"Successfully validated CAS ticket and logged in $uid")
              redirect(serviceRoot, StatusCodes.Found)
            }
          case Failure(t) =>
            logger.info(s"CAS ticket validated but no user data found for ${uid}: ${t.getMessage}")
            complete(StatusCodes.Unauthorized, s"Could not find user data for user id $uid: ${t.getMessage}")
        }
      case Failure(t) =>
        logger.info(s"CAS ticket $ticket validation failed: ${t.getMessage}")
        complete(StatusCodes.Unauthorized, s"Validating ticket $ticket failed: ${t.getMessage}")
    }
  }

  @ApiOperation(value = "Käyttäjän kirjautuminen", httpMethod = "GET")
  @Path("/login")
  @ApiResponses(Array(
    new ApiResponse(code = 302, message = "Uudelleenohjaus CASsille, service-parametrina /authenticate endpoint"),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def loginRoute: Route = path("login") {
    get {
      logger.info(s"/login reached, redirecting to CAS login")
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
          logger.info(s"Got redirect to /authenticate from CAS login")
          authenticateUser(t)
        case None =>
          logger.info(s"Got to /authenticate from CAS login but no ticket was provided, redirecting to cas/login")
          redirect(userService.loginUrl, StatusCodes.Found)
      }
    }
  }

  @ApiOperation(value = "CAS backchannel logout", httpMethod = "POST")
  @Path("/authenticate")
  @ApiResponses(Array(
    new ApiResponse(code = 302, message = "")))
  def casRoute: Route = path("authenticate") {
    post {
      formFieldMap { formFields =>
        logger.info(s"Got CAS backchannel logout request, form: $formFields")
        val param = formFields.getOrElse("logoutRequest", throw new RuntimeException("Required parameter logoutRequest not found"))
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
      optionalSession(refreshable, usingCookies) {
        case Some(ticket) =>
          logger.info(s"Got manual logout request for ticket $ticket")
          removeTicket(ticket)
          redirect(userService.loginUrl, StatusCodes.Found)
        case None =>
          logger.info(s"Got manual logout request but was not logged in")
          complete(StatusCodes.Unauthorized, "Tried to logout but was not logged in")
      }
    }
  }

  val routes: Route = loginRoute ~ authenticationRoute ~ casRoute ~ logoutRoute
}

