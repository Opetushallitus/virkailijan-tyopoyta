package util

import fi.vm.sade.vst.Configuration
import org.flywaydb.core.Flyway
import org.specs2.execute.AsResult
import org.specs2.mutable.Around

trait TestSpecification extends Configuration {
  override lazy val dbType: String = "h2"

  /*private def flywayData(): Unit = {
    val commonLocation: String = "classpath:/migration/common"
    val h2Location: String = "classpath:/migration/h2"
    val flyway = new Flyway()

    flyway.setDataSource(dBConfig.url, dBConfig.username, dBConfig.password)
    flyway.setLocations(commonLocation, h2Location)
    flyway.migrate()
  }*/

  trait WithDefaultData extends Around {
    val commonLocation: String = "classpath:/migration/common"
    val h2Location: String = "classpath:/migration/h2"
    val flyway = new Flyway()

    flyway.setDataSource(dBConfig.url, dBConfig.username, dBConfig.password)
    flyway.setLocations(commonLocation, h2Location)
    flyway.migrate()

    override def around[T: AsResult](t: => T) = {
      AsResult.effectively(t)
    }
  }
}
