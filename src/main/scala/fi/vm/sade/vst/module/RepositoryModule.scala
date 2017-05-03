package fi.vm.sade.vst.module

import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.repository._

trait RepositoryModule extends Configuration {
  import com.softwaremill.macwire._

  lazy val releaseRepository: ReleaseRepository = wire[DBReleaseRepository]
  lazy val emailRepository: EmailRepository = wire[DBEmailRepository]
  lazy val userRepository: UserRepository = wire[DBUserRepository]
}
