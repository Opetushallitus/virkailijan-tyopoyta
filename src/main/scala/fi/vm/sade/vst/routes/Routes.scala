package fi.vm.sade.vst.routes

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import fi.vm.sade.vst.repository.MockRepository
object Routes extends Directives with ResponseUtils with JsonSupport{

  val apiRoutes: Route = {
    get{
      path("releases"){sendResponse(MockRepository.getReleases)}
    } ~
    post{
      path("releases"){
        entity(as[String]){json =>
          val release = parseRelease(json)
          release match {
            case Some(r) => sendResponse(MockRepository.addRelease(r))
            case None => complete(StatusCodes.BadRequest)
          }
        }
      }
    }
  }

  val routes: Route = {
    pathPrefix("virkailijan-tyopoyta"){
      get {
       pathEndOrSingleSlash { getFromResource("ui/index.html") } ~
       encodeResponse { getFromResourceDirectory("ui") }
      } ~
      pathPrefix("api") {apiRoutes}
    }
  }
}
