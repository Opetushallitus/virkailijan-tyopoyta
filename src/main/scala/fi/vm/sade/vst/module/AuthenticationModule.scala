package fi.vm.sade.vst.module

import fi.vm.sade.utils.cas._
import fi.vm.sade.utils.kayttooikeus.KayttooikeusUserDetailsService
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.security.CasUtils
import org.http4s.client.blaze.{BlazeClient, BlazeClientConfig, SimpleHttp1Client}

import scala.concurrent.duration.DurationInt

trait AuthenticationModule extends Configuration {

  import com.softwaremill.macwire._

  lazy val httpConfig = BlazeClientConfig.defaultConfig.copy(responseHeaderTimeout = 60.seconds)
  lazy val httpClient = SimpleHttp1Client(httpConfig)

  lazy val casClient = new CasClient(urls.url("cas.url"), httpClient, callerId)

  lazy val casUtils: CasUtils = wire[CasUtils]
  lazy val userDetailsService: KayttooikeusUserDetailsService = wire[KayttooikeusUserDetailsService]
}
