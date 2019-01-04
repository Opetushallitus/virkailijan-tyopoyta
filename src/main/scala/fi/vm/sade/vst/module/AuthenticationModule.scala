package fi.vm.sade.vst.module

import fi.vm.sade.utils.cas._
import fi.vm.sade.utils.kayttooikeus.KayttooikeusUserDetailsService
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.security.CasUtils
import org.http4s.client

trait AuthenticationModule extends Configuration {

  import com.softwaremill.macwire._

  lazy val casClient = new CasClient(urls.url("cas.url"), client.blaze.defaultClient)

  lazy val casUtils: CasUtils = wire[CasUtils]
  lazy val userDetailsService: KayttooikeusUserDetailsService = wire[KayttooikeusUserDetailsService]
}
