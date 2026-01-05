package fi.vm.sade.vst.module

import fi.vm.sade.javautils.nio.cas.CasConfig.CasConfigBuilder
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.module.SharedHttpClient.instance
import fi.vm.sade.vst.security.CasUtils

trait AuthenticationModule extends Configuration {
  import com.softwaremill.macwire._

  private lazy val casConfig: CasConfig =
    new CasConfigBuilder(
      authenticationConfig.casUsername,
      authenticationConfig.casPassword,
      urls.url("cas.url"),
      "",
      authenticationConfig.serviceId,
      authenticationConfig.serviceId,
      ""
    ).build()

  /** CAS Client for validating tickets. */
  lazy val ticketValidationClient: CasClient = CasClientBuilder.buildFromConfigAndHttpClient(casConfig, instance)

  lazy val casUtils: CasUtils = wire[CasUtils]
}
