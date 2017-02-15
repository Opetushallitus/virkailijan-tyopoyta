package fi.vm.sade.vst.repository

import fi.vm.sade.vst.DBConfig
import org.flywaydb.core.Flyway

class Migrations(dBConfig: DBConfig) {

  private val flyway = new Flyway()
  flyway.setDataSource(dBConfig.url, dBConfig.username, dBConfig.password)

  def run(): Unit = {
    val migrations = flyway.migrate()
    if(migrations > 0) println(s"Successfully ran $migrations migrations" )
  }
}
