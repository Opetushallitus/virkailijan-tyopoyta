package fi.vm.sade.vst.repository

import fi.vm.sade.vst.{DBConfig, Logging}
import org.flywaydb.core.Flyway

class Migrations(dBConfig: DBConfig) extends Logging{
  private val commonLocation: String = "classpath:/migration/common"
  private val h2Location: String = "classpath:/migration/h2"
  private val flyway = new Flyway()

  flyway.setDataSource(dBConfig.url, dBConfig.username, dBConfig.password)

  def run(): Unit = {
    flyway.setLocations(commonLocation)
    val migrations = flyway.migrate()
    logger.info(s"Ran $migrations common migrations")

    mockData()
  }

  def mockData(): Unit = {
    if (dBConfig.dbType.toLowerCase.equals("h2")) {
      flyway.setLocations(commonLocation, h2Location)
      val migrations = flyway.migrate()
      logger.info(s"Ran $migrations test data migrations")
    }
  }
}
