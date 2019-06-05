package fi.vm.sade.vst.service

import fi.vm.sade.utils.kayttooikeus.KayttooikeusUserDetailsService
import org.junit.runner.RunWith
import org.specs2.matcher.ShouldMatchers
import org.specs2.mutable.Specification
import org.specs2.runner.JUnitRunner

@RunWith(classOf[JUnitRunner])
class UserServiceSpec extends Specification with ShouldMatchers {
  "UserService" should {
    "be able to use KayttooikeusUserDetailsService" in {
      val detailsService: KayttooikeusUserDetailsService = new KayttooikeusUserDetailsService()

      detailsService.getUserByUsername("lol-user", "caller-id", "userdetaulsurl") should beLeft
    }
  }
}
