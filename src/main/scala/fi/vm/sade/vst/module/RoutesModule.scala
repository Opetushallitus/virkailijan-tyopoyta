package fi.vm.sade.vst.module

import akka.actor.ActorSystem
import fi.vm.sade.vst.server.routes._
import fi.vm.sade.vst.server.{Routes, SwaggerDocService}

trait RoutesModule
  extends ServiceModule
    with RepositoryModule {

  implicit val system = ActorSystem("vst-actorsystem", serverConfig.actorSystemConfig)

  import com.softwaremill.macwire._

  //    lazy val quartzScheduler: QuartzScheduler = wire[QuartzScheduler]

  lazy val generalRoutes: GeneralRoutes = wire[GeneralRoutes]
  lazy val frontEndRoutes: FrontEndRoutes = wire[FrontEndRoutes]
  lazy val loginRoutes: LoginRoutes = wire[LoginRoutes]
  lazy val notificationRoutes: NotificationRoutes = wire[NotificationRoutes]
  lazy val releaseRoutes: ReleaseRoutes = wire[ReleaseRoutes]
  lazy val timelineRoutes: TimelineRoutes = wire[TimelineRoutes]
  lazy val userRoutes: UserRoutes = wire[UserRoutes]
  lazy val emailRoutes: EmailRoutes = wire[EmailRoutes]
  lazy val healthRoutes: HealthRoutes = wire[HealthRoutes]

  lazy val swaggerService: SwaggerDocService = wire[SwaggerDocService]

  lazy val routes: Routes = wire[Routes]
}
