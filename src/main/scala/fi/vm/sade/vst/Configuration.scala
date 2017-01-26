package fi.vm.sade.vst

import java.io.File
import java.nio.file.Paths

import com.typesafe.config.{Config, ConfigFactory}
import fi.vm.sade.security.ldap.LdapConfig

case class AuthenticationConfig(casUrl: String, serviceId: String, memoizeDuration: Int)
case class ServerConfig(port: Int)

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

  private lazy val referenceConfig = ConfigFactory.parseResources("conf/application.conf")

  private lazy val config: Config = ConfigFactory.parseFile(confFile).withFallback(referenceConfig)

}
