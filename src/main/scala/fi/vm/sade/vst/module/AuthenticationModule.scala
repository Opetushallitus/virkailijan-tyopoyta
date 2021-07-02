package fi.vm.sade.vst.module

import fi.vm.sade.javautils.nio.cas._
import fi.vm.sade.utils.kayttooikeus.KayttooikeusUserDetailsService
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.security.CasUtils

trait AuthenticationModule extends Configuration {

  import com.softwaremill.macwire._

  lazy val casClient = new CasClient(new CasConfig(
    config.getString("virkailijan-tyopoyta.cas.user"),
    config.getString("virkailijan-tyopoyta.cas.password"),
    config.getString("virkailijan-tyopoyta.cas.url"),
    urls.url("cas.url"),
    csrf,
    callerId,
    "JSESSIONID",
    "/j_spring_cas_security_check",
    null
  ))
  lazy val casUtils: CasUtils = wire[CasUtils]
  lazy val userDetailsService: KayttooikeusUserDetailsService = wire[KayttooikeusUserDetailsService]
}
