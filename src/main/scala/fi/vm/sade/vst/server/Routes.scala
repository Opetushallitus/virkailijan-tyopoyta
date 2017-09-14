package fi.vm.sade.vst.server

import akka.http.scaladsl.server.{Directives, Route}
import fi.vm.sade.vst.server.routes._


class Routes(generalRoutes: GeneralRoutes,
             releaseRoutes: ReleaseRoutes,
             notificationRoutes: NotificationRoutes,
             timelineRoutes: TimelineRoutes,
             userRoutes: UserRoutes,
             emailRoutes: EmailRoutes,
             loginRoutes: LoginRoutes,
             swaggerDocService: SwaggerDocService)
  extends Directives {


  val apiRoutes: Route = pathPrefix("api") {
    releaseRoutes.routes ~
      notificationRoutes.routes ~
      timelineRoutes.routes ~
      userRoutes.routes ~
      generalRoutes.routes ~
      emailRoutes.routes
  }

  val frontEndRoutes: Route = get {
    pathEndOrSingleSlash {
      getFromResource("ui/index.html")
    } ~
      encodeResponse {
        getFromResourceDirectory("ui")
      }
  }

  val routes: Route = {
    pathPrefix("virkailijan-tyopoyta") {
      frontEndRoutes ~ loginRoutes.routes ~ apiRoutes ~ swaggerDocService.swaggerRoutes
    }
  }
}
