package fi.vm.sade.vst

import java.io.File
import java.nio.file.Paths

import com.typesafe.config.{Config, ConfigFactory}
import fi.vm.sade.security.ldap.LdapConfig

case class AuthenticationConfig(casUrl: String, serviceId: String, memoizeDuration: Int)
case class ServerConfig(port: Int)
case class DBConfig(url: String, driver: String, username: String, password: String, pageLength: Int, dbType: String, dbPoolConfig: DBPoolConfig)
case class DBPoolConfig(initialiSize: Int, maxSize: Int, connectionTimeoutMillis: Long, validationQuery: String)

trait Configuration {

  private lazy val homeDir = sys.props.getOrElse("user.home", "")
  private lazy val confFile: File = Paths.get(homeDir, "/oph-configuration/common.properties").toFile

  lazy val ldapConfig = LdapConfig(
    config.getString("ldap.server.host"),
    config.getString("ldap.user.dn"),
    config.getString("ldap.user.password"))

  private val casUrl = config.getString("cas.url")
  private val casService = config.getString("virkailijan-tyopoyta.cas.service")
  lazy val authenticationConfig = AuthenticationConfig(casUrl, s"$casService/authenticate", 10)
  lazy val serverConfig = ServerConfig(config.getInt("server.port"))
  lazy val loginPage = config.getString("virkailijan-tyopoyta.login")
  lazy val ophLogoUrl = config.getString("oph.logo.url")

  private lazy val referenceConfig = ConfigFactory.parseResources("conf/application.conf")

  private lazy val config: Config = ConfigFactory.parseFile(confFile).withFallback(referenceConfig)

  lazy val dBConfig: DBConfig = DBConfig(
    config.getString(s"db.$dbType.uri"),
    config.getString(s"db.$dbType.driver"),
    config.getString(s"db.$dbType.username"),
    config.getString(s"db.$dbType.password"),
    config.getInt(s"db.page.length"),
    dbType,
    dbPoolConfig)

  lazy val dbPoolConfig: DBPoolConfig = DBPoolConfig(
    config.getInt(s"db.pool.poolInitialSize"),
    config.getInt(s"db.pool.poolMaxSize"),
    config.getLong(s"db.pool.poolConnectionTimeoutMillis"),
    config.getString(s"db.pool.poolValidationQuery"))

  lazy val dbType: String = config.getString("db.type")
}
