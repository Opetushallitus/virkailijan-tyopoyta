package fi.vm.sade.vst.util

import java.nio.file.Paths

import com.typesafe.config.{Config, ConfigFactory}
import fi.vm.sade.vst.Configuration
import org.flywaydb.core.Flyway
import org.specs2.execute.{AsResult, Result}
import org.specs2.mutable.Specification
import org.specs2.specification.Around

trait TestDBData extends Configuration {
  this: Specification =>
  sequential

  override lazy val config: Config = ConfigFactory.parseFile(Paths.get("src/test/resources/oph-configuration/common.properties").toFile);

  override lazy val dbType: String = "h2"
  private val commonLocation = "classpath:/migration/common"
  private val h2Location = "classpath:/migration/h2"

  private def newFlywayInstance(): Flyway =
    Flyway
      .configure()
      .dataSource(dBConfig.url, dBConfig.username, dBConfig.password)
      .locations(commonLocation, h2Location)
      .cleanDisabled(false)
      .load()

  private def cleanDb(): Unit = {
    val flyway = newFlywayInstance()
    flyway.clean()
    flyway.migrate()
  }

  trait WithDefaultData extends Around {
    cleanDb()

    override def around[T: AsResult](t: => T): Result = {
      AsResult.effectively(t)
    }
  }

}
