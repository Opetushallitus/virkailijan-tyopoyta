package fi.vm.sade.vst.module

import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.repository.Migrations

trait MigrationModule extends Configuration {
  import com.softwaremill.macwire._

  lazy val migrations: Migrations = wire[Migrations]
}
