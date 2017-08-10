package util

import java.nio.file.Paths

import com.typesafe.config.{Config, ConfigFactory}
import fi.vm.sade.vst.Configuration
import org.flywaydb.core.Flyway
import org.specs2.execute.AsResult
import org.specs2.mutable.Specification
import org.specs2.specification.Around

trait TestDBData extends Configuration { this: Specification =>
  sequential

  override lazy val config: Config = ConfigFactory.parseFile(Paths.get("src/test/resources/oph-configuration/common.properties").toFile);

  override lazy val dbType: String = "h2"
  private val commonLocation: String = "classpath:/migration/common"
  private val h2Location: String = "classpath:/migration/h2"
  private val flyway = new Flyway()

  private def cleanDb(): Unit = {
    flyway.setDataSource(dBConfig.url, dBConfig.username, dBConfig.password)
    flyway.setLocations(commonLocation, h2Location)
    flyway.clean()
    flyway.migrate()
  }

  trait WithDefaultData extends Around {
    cleanDb()

    override def around[T: AsResult](t: => T) = {
      AsResult.effectively(t)
    }
  }
}
