package fi.vm.sade.vst.server

import fi.vm.sade.vst.actor.scheduler.QuartzScheduler
import fi.vm.sade.vst.repository.RepositoryModule
import fi.vm.sade.vst.security.{AuthenticationModule, UserService}
import fi.vm.sade.vst.service.EmailService

trait ServerModule extends AuthenticationModule with RepositoryModule {

  import com.softwaremill.macwire._

  lazy val routes: Routes = wire[Routes]

  lazy val userService: UserService = wire[UserService]
  lazy val emailService: EmailService = wire[EmailService]
  lazy val quartzScheduler: QuartzScheduler = wire[QuartzScheduler]
}
