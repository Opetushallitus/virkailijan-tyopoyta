package fi.vm.sade.vst.repository

import fi.vm.sade.vst.DBConfig
import org.flywaydb.core.Flyway

class Migrations(dBConfig: DBConfig) {
  private val commonLocation: String = "classpath:/migration/common"
  private val h2Location: String = "classpath:/migration/h2"
  private val flyway = new Flyway()

  println("DB config " + dBConfig )

  flyway.setDataSource(dBConfig.url, dBConfig.username, dBConfig.password)

  def run(): Unit = {
    flyway.setLocations(commonLocation)
    val migrations = flyway.migrate()
    println(s"Ran $migrations common migrations")

    mockData()
  }

  def mockData(): Unit = {
    if (dBConfig.dbType.toLowerCase.equals("h2")) {
      flyway.setLocations(commonLocation, h2Location)
      val migrations = flyway.migrate()
      println(s"Ran $migrations test data migrations")
    }
  }
}
