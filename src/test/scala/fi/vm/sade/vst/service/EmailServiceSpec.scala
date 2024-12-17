package fi.vm.sade.vst.service

import com.typesafe.config.Config
import fi.oph.viestinvalitys.ViestinvalitysClient
import fi.oph.viestinvalitys.vastaanotto.model.{Lahetys, LuoLahetysSuccessResponse, LuoViestiSuccessResponse, Viesti}
import fi.vm.sade.vst.util.{FakeReleaseData, TestDBData}
import org.junit.runner.RunWith
import org.specs2.matcher.ShouldMatchers
import org.specs2.mutable.Specification
import org.specs2.runner.JUnitRunner
import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model.Release
import fi.vm.sade.vst.module.ServiceModule
import fi.vm.sade.vst.security.{CasUtils, KayttooikeusService, UserService}
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.{times, verify, when}
import org.mockito.ArgumentMatchers.any
import org.scalatestplus.mockito.MockitoSugar

import java.net.InetAddress
import java.util.{Optional, UUID}
import scala.collection.JavaConverters.{asJavaIterableConverter, iterableAsScalaIterableConverter}

@RunWith(classOf[JUnitRunner])
class EmailServiceSpec extends Specification with TestDBData with ShouldMatchers with MockitoSugar {

  trait MockConfiguration extends Configuration {
    // Mockataan tarvittavat konffit jotta testattava luokka ei räjähdä
    override lazy val config: Config = mock[Config]

    override lazy val dbType: String = config.getString("db")
    override lazy val emailSendingDisabled = false
  }

  val mockCasUtils = mock[CasUtils]
  val mockAccessService = mock[KayttooikeusService]
  val mockUserService = mock[UserService]
  private val mockViestinvalitysClient = mock[ViestinvalitysClient]
  val mockHtmlService: HtmlService = mock[HtmlService]

  // mock html-viestipohjan virittelylle
  def mockHtmlString(releases: Set[Release], language: String): String = {
    s"<html><body>Koonti päivän tiedotteista. Yhteensä ${releases.size} tiedotetta kielellä $language</body></html>"
  }

  implicit val auditUser: AuditUser = new AuditUser(null, InetAddress.getLocalHost, null, null)
  val adminUserOid: Option[String] = Some("1.2.3.8")

  val release1 = FakeReleaseData.generateRelease
  val release2 = FakeReleaseData.generateRelease
  val releases = Set(release1, release2)
  // testattava instanssi mockeilla höystettynä
  private val emailService = new EmailService(mockCasUtils, mockAccessService, mockUserService, mockHtmlService) with MockConfiguration {
    override lazy val viestinvalitysClient: ViestinvalitysClient = mockViestinvalitysClient

    // feikataan apumetodi, 2 mock-käyttäjää hieman eri tiedotejoukolla
    override def getUsersToReleaseSets(releases: Seq[Release]): Seq[(BasicUserInformation, Set[Release])] = {
      Seq(
        (BasicUserInformation("1.2.3.4", "user1@example.com", Seq("fi")), Set(release1, release2)),
        (BasicUserInformation("1.2.3.5", "user2@example.com", Seq("fi")), Set(release1))
      )
    }

  }

  "EmailService" should {
    "call viestinvalitysClient.luoLahetys with the correct values" in {
      // Mockataan html-tiedotepohjan generointi
      when(mockHtmlService.htmlString(any[Iterable[Release]], any[String])).thenReturn(mockHtmlString(releases, "fi"))

      // Stub viestinvalitysClient.luoLahetys
      val mockLahetysResponse = mock[LuoLahetysSuccessResponse]
      when(mockLahetysResponse.getLahetysTunniste).thenReturn(UUID.randomUUID())
      when(mockViestinvalitysClient.luoLahetys(any[Lahetys])).thenReturn(mockLahetysResponse)

      // Stub viestinvalitysClient.luoViesti
      val mockViestiResponse = mock[LuoViestiSuccessResponse]
      when(mockViestinvalitysClient.luoViesti(any[Viesti])).thenReturn(mockViestiResponse)

      val result = emailService.sendEmails(Seq.empty, emailService.ImmediateEmail, adminUserOid)

      // Viestinvälityspalvelun lähetyksen ja viestin luonti meni odotetuilla kutsuilla
      val lahetysCaptor: ArgumentCaptor[Lahetys] = ArgumentCaptor.forClass(classOf[Lahetys])

      verify(mockViestinvalitysClient).luoLahetys(lahetysCaptor.capture())
      val capturedLahetys = lahetysCaptor.getValue

      capturedLahetys.getOtsikko.isPresent must beTrue
      capturedLahetys.getOtsikko.get must startWith("Virkailijan työpöydän tiedotteet")

      capturedLahetys.getLahettaja.isPresent must beTrue
      capturedLahetys.getLahettaja.get().getSahkopostiOsoite shouldEqual Optional.of("noreply@opintopolku.fi")
      capturedLahetys.getLahettavanVirkailijanOid.isPresent must beTrue
      capturedLahetys.getLahettavanVirkailijanOid shouldEqual Optional.of(adminUserOid.get)
      capturedLahetys.getLahettavaPalvelu shouldEqual Optional.of("virkailijantyopoyta")
      capturedLahetys.getSailytysaika shouldEqual Optional.of(365)
      capturedLahetys.getPrioriteetti shouldEqual Optional.of("normaali")

      val viestiCaptor: ArgumentCaptor[Viesti] = ArgumentCaptor.forClass(classOf[Viesti])
      verify(mockViestinvalitysClient, times(2)).luoViesti(viestiCaptor.capture())
      // viimeisimmän mock-kutsun parametri
      val capturedViesti = viestiCaptor.getValue
      capturedViesti.getLahetysTunniste.isPresent must beTrue
      capturedViesti.getOtsikko.isPresent must beTrue
      // huom. lähetyksen ja viestin otsikko ei ole sama
      capturedViesti.getOtsikko.get must startWith("Koonti päivän tiedotteista")
      capturedViesti.getSisalto.isPresent must beTrue
      capturedViesti.getSisalto.get must contain("<html><body>Koonti päivän tiedotteista. Yhteensä 2 tiedotetta kielellä fi</body></html>")
      capturedViesti.getSisallonTyyppi shouldEqual Optional.of("html")
      capturedViesti.getKielet shouldEqual Optional.of(java.util.Arrays.asList("fi"))
      capturedViesti.getMaskit.isPresent must beFalse
      capturedViesti.getMetadata.isPresent must beFalse
      capturedViesti.getLiitteidenTunnisteet.isPresent must beFalse
      capturedViesti.getReplyTo.isPresent must beFalse
      capturedViesti.getVastaanottajat.get().size() shouldEqual 1
      // lähetykselle annettuja tietoja ei ole annettu uudestaan viestiä luodessa
      capturedViesti.getPrioriteetti.isPresent must beFalse
      capturedViesti.getSailytysaika.isPresent must beFalse
      capturedViesti.getLahettaja.isPresent must beFalse
      capturedViesti.getLahettavanVirkailijanOid.isPresent must beFalse
      capturedViesti.getLahettavaPalvelu.isPresent must beFalse
      // kaikkien luotujen viestien vastaanottajat
      val capturedViestit = viestiCaptor.getAllValues
      capturedViestit.size() shouldEqual 2
      val vastaanottajaEmailit: List[String] = capturedViestit.asScala.flatMap { viesti =>
        viesti.getVastaanottajat match {
          case opt if opt.isPresent =>
            opt.get.asScala.toList.flatMap { vastaanottaja =>
              vastaanottaja.getSahkopostiOsoite match {
                case emailOpt if emailOpt.isPresent => Some(emailOpt.get)
                case _                              => None
              }
            }
          case _ => List.empty
        }
      }.toList
      vastaanottajaEmailit must contain("user1@example.com")
      vastaanottajaEmailit must contain("user2@example.com")
      capturedViesti.getKayttooikeusRajoitukset.isPresent must beTrue
      capturedViesti.getKayttooikeusRajoitukset.get.size() shouldEqual 1
      val capturedKayttooikeudet = capturedViesti.getKayttooikeusRajoitukset.get.asScala.head
      capturedKayttooikeudet.getOikeus.get() shouldEqual emailService.OPH_PAAKAYTTAJA
      capturedKayttooikeudet.getOrganisaatio.get() shouldEqual emailService.OPH_ORGANISAATIO_OID
      verify(mockHtmlService).htmlString(releases, "fi")
      result should have size 2
      result.head shouldEqual mockViestiResponse
    }
  }
}
