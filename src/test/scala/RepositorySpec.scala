import java.net.InetAddress
import java.time.LocalDate

import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.model.EmailEvent
import module.TestModule
import org.junit.runner.RunWith
import org.specs2.mutable._
import org.specs2.runner.JUnitRunner
import util.TestDBData

@RunWith(classOf[JUnitRunner])
class RepositorySpec extends Specification with TestModule with TestDBData {
  /*
   * Note:
   * These current tests in RepositorySpec and ServerSpec are simply made to demonstrate the usage of WithDefaultData.
   * They are only currently testing that the WithDefaultData actually works as intended so that the h2 db is cleared
   * on every test and are independent of specs. Only requirement is that tests are run in sequential order
   * but TestDBData trait should force this anyway. Sequential running is not required if each test uses own
   * db instance (different named db) but this would require some more complicated implementation.
   */

  implicit val auditUser: AuditUser = new AuditUser(null, InetAddress.getLocalHost, null, null)

  val testEvent: EmailEvent = EmailEvent(1l, LocalDate.now(), 1l, "testEvent")
  "EmailRepository" should {
    "not find event from empty table" in new WithDefaultData {
      emailRepository.emailEvent(1l) mustEqual None
    }

    "should add new event" in new WithDefaultData {
      emailRepository.addEvent(testEvent) mustEqual Option(testEvent)
    }

    "not find event from empty table in different test" in new WithDefaultData {
      emailRepository.emailEvent(1l) mustEqual None
    }
  }
}

