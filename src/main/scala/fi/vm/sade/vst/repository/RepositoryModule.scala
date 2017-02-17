package fi.vm.sade.vst.repository

import fi.vm.sade.vst.Configuration

trait RepositoryModule extends Configuration {

  import com.softwaremill.macwire._

  lazy val releaseRepository: ReleaseRepository = wire[DBReleaseRepository]
  lazy val emailRepository: EmailRepository = wire[DBEmailRepository]
  lazy val migrations: Migrations = wire[Migrations]
}
