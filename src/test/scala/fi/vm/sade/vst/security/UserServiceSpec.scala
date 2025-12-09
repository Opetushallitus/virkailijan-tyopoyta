package fi.vm.sade.vst.security

import com.typesafe.config.Config
import fi.vm.sade.javautils.nio.cas.UserDetails
import fi.vm.sade.vst.repository.{ReleaseRepository, UserRepository}
import fi.vm.sade.vst.{Configuration, OppijanumeroRekisteriConfig}
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito._
import org.mockito.invocation.InvocationOnMock
import org.mockito.quality.Strictness
import org.mockito.stubbing.Answer
import org.mockito.{ArgumentMatchers, MockSettings}
import org.scalatestplus.mockito.MockitoSugar
import org.specs2.execute.{AsResult, Result}
import org.specs2.matcher.ShouldMatchers
import org.specs2.mutable.Specification
import org.specs2.runner.JUnitRunner
import org.specs2.specification.Around
import play.api.libs.json.JsResultException

import scala.collection.JavaConverters._
import scala.util.Success

@RunWith(classOf[JUnitRunner]) class UserServiceSpec extends Specification with ShouldMatchers with MockitoSugar {
  trait MockConfiguration extends Configuration {
    // Mockataan tarvittavat konffit jotta testattava luokka ei räjähdä
    override lazy val config: Config = mock[Config]
    override lazy val oppijanumeroRekisteriConfig = OppijanumeroRekisteriConfig("onr-address")

    override lazy val dbType: String = config.getString("db")
  }

  val strictConfig: MockSettings = withSettings().strictness(Strictness.STRICT_STUBS)

  trait MockedContext extends Around {
    val casUtils: CasUtils = mock[CasUtils](strictConfig)
    val kayttooikeusService: KayttooikeusService = mock[KayttooikeusService](strictConfig)
    val userRepository: UserRepository = mock[UserRepository](strictConfig)
    val releaseRepository: ReleaseRepository = mock[ReleaseRepository](strictConfig)

    val userService = new UserService(casUtils, kayttooikeusService, userRepository, releaseRepository) with MockConfiguration

    override def around[T: AsResult](t: => T): Result = {
      AsResult.effectively(t)
    }
  }

  def mockOnr(casUtils: CasUtils, response: String): CasUtils#CasServiceClient = {
    val onrClient = mock[CasUtils#CasServiceClient](strictConfig)
    when(casUtils.serviceClient(ArgumentMatchers.eq("onr-address"))) thenAnswer new Answer[CasUtils#CasServiceClient]() {
      override def answer(invocation: InvocationOnMock): CasUtils#CasServiceClient = onrClient
    }
    when(onrClient.authenticatedJsonPost(any(), any())) thenReturn Success(response)
    onrClient
  }

  "UserService" >> {
    "findUser" should {
      val onrResponse: String = "[]"
      val details = new UserDetails("test-user", "1.oid", "VIRKAILIJA", "?", Set("APP_USER_1").asJava)

      def mock(context: MockedContext): CasUtils#CasServiceClient = {
        when(context.kayttooikeusService.userGroupsForUser("1.oid", isAdmin = false)) thenReturn List()
        when(context.releaseRepository.categories(any())) thenReturn List()
        mockOnr(context.casUtils, onrResponse)
      }

      "create a user when the user is not cached" in new MockedContext {
        val onrClient = mock(this)

        val result = userService.findUser(details)

        result.userId mustEqual "1.oid"
        result.initials must beNone
        result.language mustEqual "fi"
        result.isAdmin mustEqual false
        result.groups mustEqual Seq.empty
        result.roles mustEqual Seq("APP_USER_1")
        result.allowedCategories mustEqual Seq.empty
        result.profile must beSome
        result.profile.get must beNull
        result.draft must beNull

        verify(kayttooikeusService).userGroupsForUser("1.oid", isAdmin = false)
        verify(releaseRepository).categories(any())
        verify(casUtils).serviceClient("onr-address")
        verify(onrClient).authenticatedJsonPost(any(), any())
      }

      "return a cached user without calling external services" in new MockedContext {
        val onrClient = mock(this)
        userService.findUser(details)
        reset(kayttooikeusService, onrClient, casUtils, releaseRepository)

        userService.findUser(details)

        verifyNoInteractions(kayttooikeusService, onrClient, casUtils, releaseRepository)
      }
    }

    "findCachedUser" should {
      "return None when user is not cached" in new MockedContext {
        userService.findCachedUser("test-user") must beNone
        verifyNoInteractions(kayttooikeusService, casUtils, releaseRepository, userRepository)
      }

      "return user when they are cached" in new MockedContext {
        val details = new UserDetails("test-user", "1.oid", "VIRKAILIJA", "?", Set("APP_USER_1").asJava)
        userService.storeTicket("ticket", details)
        mockOnr(casUtils, "[]")
        when(releaseRepository.categories(any())) thenReturn List()

        val result = userService.findCachedUser("test-user")

        result must beSome
        result.get.userId mustEqual "1.oid"
      }
    }

    "userInitialsAndLang" should {
      "return initials with fi when language is not in the response" in new MockedContext {
        val onrResponse = """[{"kutsumanimi": "Testi", "sukunimi": "Vallaton"}]"""
        mockOnr(casUtils, onrResponse)

        val result = userService.userInitialsAndLang("1.2.3")

        result mustEqual(Some("TV"), Some("fi"))
      }

      "return another language when response has it" in new MockedContext {
        val onrResponse =
          """
            |[
            | { "kutsumanimi": "Testi",
            |   "sukunimi": "Vallaton",
            |   "asiointiKieli": {
            |     "kieliKoodi": "sv"
            |   }
            | }
            |]""".stripMargin
        mockOnr(casUtils, onrResponse)

        val result = userService.userInitialsAndLang("1.2.3")

        result mustEqual(Some("TV"), Some("sv"))
      }

      "use names and language from first object" in new MockedContext {
        val onrResponse =
          """
            |[
            | { "kutsumanimi": "muita",
            |   "sukunimi": "kirjaimia",
            |   "asiointiKieli": {
            |     "kieliKoodi": "en"
            |   }
            | },
            | { "kutsumanimi": "Testi",
            |   "sukunimi": "Vallaton",
            |   "asiointiKieli": {
            |     "kieliKoodi": "sv"
            |   }
            | }
            |]""".stripMargin
        mockOnr(casUtils, onrResponse)

        val result = userService.userInitialsAndLang("1.2.3")

        result mustEqual(Some("MK"), Some("en"))
      }

      "throw an exception when response is missing required values" in new MockedContext {
        val onrResponse = """[{"sukunimi": "Vallaton"}]"""
        mockOnr(casUtils, onrResponse)

        userService.userInitialsAndLang("1.2.3") must throwA[JsResultException]
      }
    }
  }
}
