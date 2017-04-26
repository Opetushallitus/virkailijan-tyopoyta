package fi.vm.sade.vst.server

import akka.actor.ActorSystem
import akka.http.scaladsl.server.Directives
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.actor.scheduler.QuartzScheduler
import fi.vm.sade.vst.repository.RepositoryModule
import fi.vm.sade.vst.security.{AuthenticationModule, UserService}
import fi.vm.sade.vst.server.routes._
import fi.vm.sade.vst.service.EmailService

trait ServerModule extends AuthenticationModule with Directives with RepositoryModule with Configuration {

  implicit val system = ActorSystem("vst-actorsystem", serverConfig.actorSystemConfig)

  import com.softwaremill.macwire._

  lazy val routes: Routes = wire[Routes]

  lazy val userService: UserService = wire[UserService]
  lazy val emailService: EmailService = wire[EmailService]
  lazy val quartzScheduler: QuartzScheduler = wire[QuartzScheduler]

  lazy val generalRoutes: GeneralRoutes = wire[GeneralRoutes]
  lazy val loginRoutes: LoginRoutes = wire[LoginRoutes]
  lazy val notificationRoutes: NotificationRoutes = wire[NotificationRoutes]
  lazy val releaseRoutes: ReleaseRoutes = wire[ReleaseRoutes]
  lazy val timelineRoutes: TimelineRoutes = wire[TimelineRoutes]
  lazy val userRoutes: UserRoutes = wire[UserRoutes]
  lazy val emailRoutes: EmailRoutes = wire[EmailRoutes]

  lazy val swaggerService: SwaggerDocService = wire[SwaggerDocService]

}
