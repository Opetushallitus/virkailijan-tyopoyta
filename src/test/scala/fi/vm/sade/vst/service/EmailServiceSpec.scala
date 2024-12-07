//package fi.vm.sade.vst.service
//
//import fi.oph.viestinvalitys.ViestinvalitysClient
//import fi.vm.sade.vst.module.TestModule
//import fi.vm.sade.vst.util.TestDBData
//import org.junit.runner.RunWith
//import org.scalatestplus.mockito.MockitoSugar.mock
//import org.specs2.matcher.ShouldMatchers
//import org.specs2.mutable.Specification
//import org.specs2.runner.JUnitRunner
//import fi.vm.sade.auditlog.{User => AuditUser}
//
//import java.net.InetAddress
//import java.time.LocalDate
//
//@RunWith(classOf[JUnitRunner])
//class EmailServiceSpec extends Specification with TestModule with TestDBData with ShouldMatchers {
//
//  val mockViestinvalitysClient = mock[ViestinvalitysClient]
//  implicit val auditUser: AuditUser = new AuditUser(null, InetAddress.getLocalHost, null, null)
//  "EmailService" should {
//    "be able to construct groupEmailService" in new WithDefaultData {
//      emailService.sendEmailsForDate(LocalDate.now())
//    }
//  }
//}
