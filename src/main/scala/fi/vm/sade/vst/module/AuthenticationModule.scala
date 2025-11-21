package fi.vm.sade.vst.module

import fi.vm.sade.javautils.nio.cas.CasConfig.CasConfigBuilder
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.security.CasUtils
import org.asynchttpclient.Dsl.asyncHttpClient
import org.asynchttpclient.{AsyncHttpClient, DefaultAsyncHttpClientConfig}

import java.time.Duration

trait AuthenticationModule extends Configuration {

  import com.softwaremill.macwire._

  private lazy val httpConfig = new DefaultAsyncHttpClientConfig.Builder().setRequestTimeout(Duration.ofSeconds(60))
  private lazy val httpClient: AsyncHttpClient = asyncHttpClient(httpConfig)

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
  lazy val ticketValidationClient: CasClient = CasClientBuilder.buildFromConfigAndHttpClient(casConfig, httpClient)

  lazy val casUtils: CasUtils = wire[CasUtils]
}
