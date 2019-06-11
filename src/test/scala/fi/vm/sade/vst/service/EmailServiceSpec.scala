package fi.vm.sade.vst.service

import java.nio.channels.UnresolvedAddressException

import com.typesafe.config.ConfigValueFactory
import fi.vm.sade.groupemailer.{EmailData, EmailMessage, EmailRecipient, GroupEmailComponent, GroupEmailService, GroupEmailerSettings}
import fi.vm.sade.vst.module.TestModule
import fi.vm.sade.vst.util.TestDBData
import org.junit.runner.RunWith
import org.specs2.matcher.ShouldMatchers
import org.specs2.mutable.Specification
import org.specs2.runner.JUnitRunner

@RunWith(classOf[JUnitRunner])
class EmailServiceSpec extends Specification with TestModule with TestDBData with ShouldMatchers with GroupEmailComponent {
  lazy val emailConfiguration = new GroupEmailerSettings(config.withValue("cas.url", ConfigValueFactory.fromAnyRef("http://this.should.not.exist.example.com:12345/cas")))
  lazy val groupEmailService: GroupEmailService = new RemoteGroupEmailService(emailConfiguration, "virkailijan-tyopoyta-emailer")

  "EmailService" should {
    "be able to construct groupEmailService" in new WithDefaultData {
      private val emailData: EmailData = EmailData(EmailMessage("callingProcess", "subject", "body", html = false), List(EmailRecipient("frank.tester@example.com")))

      { groupEmailService.sendMailWithoutTemplate(emailData) } must throwA[UnresolvedAddressException]
    }
  }
}
