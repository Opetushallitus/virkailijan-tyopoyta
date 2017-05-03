package fi.vm.sade.vst.module

import fi.vm.sade.vst.security.{KayttooikeusService, UserService}
import fi.vm.sade.vst.service.{EmailService, ReleaseService}

trait ServiceModule extends AuthenticationModule with RepositoryModule {

  import com.softwaremill.macwire._

  lazy val userService: UserService = wire[UserService]
  lazy val releaseService: ReleaseService = wire[ReleaseService]
  lazy val emailService: EmailService = wire[EmailService]
  lazy val kayttooikeusService: KayttooikeusService = wire[KayttooikeusService]
}
