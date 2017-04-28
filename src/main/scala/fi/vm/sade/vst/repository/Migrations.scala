package fi.vm.sade.vst.repository

import fi.vm.sade.vst.{DBConfig, Logging}
import org.flywaydb.core.Flyway

class Migrations(dBConfig: DBConfig) extends Logging{
  private val commonLocation: String = "classpath:/migration/common"
  private val h2Location: String = "classpath:/migration/h2"
  private val postgresqlLocation: String = "classpath:/migration/postgresql"
  private val flyway = new Flyway()

  flyway.setDataSource(dBConfig.url, dBConfig.username, dBConfig.password)

  def run(): Unit = {
    val dbType = dBConfig.dbType.toLowerCase.equals("h2")
    if (dbType) flyway.setLocations(commonLocation, h2Location)
    else flyway.setLocations(commonLocation, postgresqlLocation)

    val migrations = flyway.migrate
    logger.info(s"Ran $migrations data migrations")
  }
}
