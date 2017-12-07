package fi.vm.sade.vst.server.routes

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Route
import fi.vm.sade.vst.server.ResponseUtils
import io.swagger.annotations._


@Api(value = "Palvelun tilaan liittyvät rajapinnat", produces = "text/plain")
@Path("")
class HealthRoutes extends ResponseUtils {

  @ApiOperation(value = "Health check", httpMethod = "GET")
  @Path("/healthcheck")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "")))
  def healthCheckRoute: Route = path("healthcheck") {
    get {
      complete(StatusCodes.OK)
    }
  }

  val routes: Route = healthCheckRoute

}
