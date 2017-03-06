package fi.vm.sade.vst.security

import fi.vm.sade.security.ldap.LdapClient
import fi.vm.sade.utils.cas._
import fi.vm.sade.vst.Configuration
import org.http4s.client

trait AuthenticationModule extends Configuration {

  import com.softwaremill.macwire._

  lazy val casClient = new CasClient(authenticationConfig.casUrl, client.blaze.defaultClient)

  lazy val casUtils: CasUtils = wire[CasUtils]
  lazy val ldapClient: LdapClient = wire[LdapClient]
  lazy val kayttooikeusService: KayttooikeusService = wire[KayttooikeusService]

}
