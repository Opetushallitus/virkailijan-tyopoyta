package fi.vm.sade.vst.repository

import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.vst.DBConfig
import org.flywaydb.core.Flyway

class Migrations(dBConfig: DBConfig) extends LazyLogging {
  private val commonLocation = "classpath:/migration/common"
  private val h2Location = "classpath:/migration/h2"
  private val postgresqlLocation = "classpath:/migration/postgresql"

  def run(): Unit = {
    val isH2 = dBConfig.dbType.equalsIgnoreCase("h2")

    val locations =
      if (isH2) Array(commonLocation, h2Location)
      else Array(commonLocation, postgresqlLocation)

    val flyway = Flyway
      .configure()
      .table("schema_version")
      .dataSource(dBConfig.url, dBConfig.username, dBConfig.password)
      .locations(locations: _*)
      .load()

    val result = flyway.migrate()
    logger.info(s"Ran ${result.migrationsExecuted} data migrations")
  }
}
