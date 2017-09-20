package fi.vm.sade.vst.server

import akka.http.scaladsl.server.{Directives, Route}
import fi.vm.sade.vst.server.routes._


class Routes(generalRoutes: GeneralRoutes,
             frontEndRoutes: FrontEndRoutes,
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

  val routes: Route = {
    pathPrefix("virkailijan-tyopoyta") {
      frontEndRoutes.routes ~ loginRoutes.routes ~ apiRoutes ~ swaggerDocService.swaggerRoutes
    }
  }
}
