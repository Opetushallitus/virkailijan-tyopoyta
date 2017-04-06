package fi.vm.sade.vst

import java.io.File
import java.nio.file.Paths

import com.softwaremill.session.SessionConfig
import com.typesafe.config.{Config, ConfigFactory, ConfigValueFactory}
import fi.vm.sade.security.ldap.LdapConfig

case class AuthenticationConfig(casUrl: String, serviceId: String, casUsername: String, casPassword: String, kayttooikeusUri: String,  memoizeDuration: Int)
case class ServerConfig(port: Int)
case class DBConfig(url: String, driver: String, username: String, password: String, pageLength: Int, dbType: String, dbPoolConfig: DBPoolConfig)
case class DBPoolConfig(initialiSize: Int, maxSize: Int, connectionTimeoutMillis: Long, validationQuery: String)
case class CasConfig(casUrl: String, casUsername: String, casPassword: String)
case class EmailConfig(serviceAddress: String, casConfig: CasConfig)

trait Configuration {

  private lazy val homeDir = sys.props.getOrElse("user.home", "")
  private lazy val confFile: File = Paths.get(homeDir, "/oph-configuration/common.properties").toFile

  lazy val ldapConfig = LdapConfig(
    config.getString("ldap.server.host"),
    config.getString("ldap.user.dn"),
    config.getString("ldap.user.password"))


  lazy val authenticationConfig = AuthenticationConfig(
    config.getString("cas.url"),
    config.getString("virkailijan-tyopoyta.cas.service"),
    config.getString("virkailijan-tyopoyta.cas.user"),
    config.getString("virkailijan-tyopoyta.cas.password"),
    config.getString("kayttooikeus.url"),
    10)

  lazy val defaultCasConfig = CasConfig(config.getString("cas.url"), config.getString("cas.username"), config.getString("cas.password"))
  lazy val emailConfig = EmailConfig(config.getString("osoitepalvelu.service"), defaultCasConfig)

  lazy val serverConfig = ServerConfig(
    config.getInt("server.port"))
  lazy val loginPage = config.getString("virkailijan-tyopoyta.login")
  lazy val ophLogoUrl = config.getString("oph.logo.url")

  private lazy val referenceConfig = ConfigFactory.parseResources("conf/application.conf")

  lazy val config: Config = ConfigFactory.parseFile(confFile).withFallback(referenceConfig)

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

  private lazy val sessionSecret = config.getString("virkailijan-tyopoyta.session.secret")

  private lazy val sessionConf = ConfigFactory.parseResources("conf/session.conf")
    .withValue("akka.http.session.server-secret", ConfigValueFactory.fromAnyRef(sessionSecret))

  lazy val sessionConfig: SessionConfig = SessionConfig.fromConfig(sessionConf)
}
