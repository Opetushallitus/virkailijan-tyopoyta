package fi.vm.sade.vst

import java.io.File
import java.nio.file.Paths

import com.softwaremill.session.SessionConfig
import com.typesafe.config.{Config, ConfigFactory, ConfigValueFactory}
import fi.vm.sade.properties.OphProperties

import scala.concurrent.duration._

case class AuthenticationConfig(serviceId: String, casUsername: String, casPassword: String, memoizeDuration: Duration)
case class ServerConfig(port: Int, actorSystemConfig: Config)
case class DBConfig(url: String, driver: String, username: String, password: String, pageLength: Int, dbType: String, dbPoolConfig: DBPoolConfig)
case class DBPoolConfig(initialiSize: Int, maxSize: Int, connectionTimeoutMillis: Long, validationQuery: String)
case class CasConfig(casUrl: String, casUsername: String, casPassword: String)
case class OppijanumeroRekisteriConfig(serviceAddress: String)

trait Configuration {

  private lazy val homeDir = sys.props.getOrElse("user.home", "")
  private lazy val confFile: File = Paths.get(homeDir, "/oph-configuration/common.properties").toFile

  lazy val urls: OphProperties = new fi.vm.sade.scalaproperties.OphProperties()
    .addFiles("/virkailjian-tyopoyta-oph.properties")
    .addOptionalFiles(s"$homeDir/oph-configuration/common.properties")
    .addDefault("baseUrl", config.getString("baseUrl"))
    .addDefault("host.alb", config.getString("host.alb"))

  lazy val authenticationConfig = AuthenticationConfig(
    config.getString("virkailijan-tyopoyta.cas.service"),
    config.getString("virkailijan-tyopoyta.cas.user"),
    config.getString("virkailijan-tyopoyta.cas.password"),
    10.minutes
  )

  lazy val defaultCasConfig = CasConfig(
    config.getString("cas.url"),
    config.getString("virkailijan-tyopoyta.cas.user"),
    config.getString("virkailijan-tyopoyta.cas.password")
  )
  lazy val oppijanumeroRekisteriConfig = OppijanumeroRekisteriConfig(urls.url("oppijanumerorekisteri.service"))

  lazy val emailSendingDisabled: Boolean = config.getString("tyopoyta.emails.disabled").toBoolean

  lazy val actorSystemConfig: Config = ConfigFactory.parseResources("conf/akka.conf")

  lazy val serverConfig = ServerConfig(config.getInt("server.port"), actorSystemConfig)

  lazy val loginPage: String = config.getString("virkailijan-tyopoyta.login")
  lazy val ophLogoUrl: String = config.getString("oph.logo.url")

  lazy val config: Config = ConfigFactory.parseFile(confFile)

  lazy val dBConfig: DBConfig = DBConfig(
    config.getString(s"db.$dbType.uri"),
    config.getString(s"db.$dbType.driver"),
    config.getString(s"db.$dbType.username"),
    config.getString(s"db.$dbType.password"),
    config.getInt(s"db.page.length"),
    dbType,
    dbPoolConfig
  )

  lazy val dbPoolConfig: DBPoolConfig = DBPoolConfig(
    config.getInt(s"db.pool.poolInitialSize"),
    config.getInt(s"db.pool.poolMaxSize"),
    config.getLong(s"db.pool.poolConnectionTimeoutMillis"),
    config.getString(s"db.pool.poolValidationQuery")
  )

  lazy val dbType: String = config.getString("db.type")

  private lazy val sessionSecret = config.getString("virkailijan-tyopoyta.session.secret")

  private lazy val sessionConf = ConfigFactory.parseResources("conf/session.conf")
    .withValue("akka.http.session.server-secret", ConfigValueFactory.fromAnyRef(sessionSecret))

  lazy val sessionConfig: SessionConfig = SessionConfig.fromConfig(sessionConf)


}
