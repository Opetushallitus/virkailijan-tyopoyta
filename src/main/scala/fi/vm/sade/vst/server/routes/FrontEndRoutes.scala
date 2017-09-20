package fi.vm.sade.vst.server.routes

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Route
import fi.vm.sade.vst.security.UserService
import fi.vm.sade.vst.server.SessionSupport
import io.swagger.annotations._


@Api(value = "Kirjautumiseen liittyvät rajapinnat", produces = "application/json")
@Path("")
class FrontEndRoutes(val userService: UserService) extends SessionSupport {

  val route: Route =
    get {
      extractTicketOption {
        case Some(_) =>
          pathEndOrSingleSlash {
            getFromResource("ui/index.html")
          }
        case None =>
          redirect(userService.loginUrl, StatusCodes.Found)
      } ~
        encodeResponse {
          getFromResourceDirectory("ui")
        }
    }

  val routes: Route = route
}

