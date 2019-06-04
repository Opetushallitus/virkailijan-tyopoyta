package fi.vm.sade.vst.server

import java.net.InetAddress
import java.time.LocalDate

import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.model.EmailEvent
import fi.vm.sade.vst.module.TestModule
import fi.vm.sade.vst.util.TestDBData
import org.junit.runner.RunWith
import org.specs2.mutable._
import org.specs2.runner.JUnitRunner

@RunWith(classOf[JUnitRunner])
class ServerSpec extends Specification with TestModule with TestDBData {
  /*
   * Note:
   * These current tests in fi.vm.sade.vst.repository.RepositorySpec and fi.vm.sade.vst.server.ServerSpec are simply made to demonstrate the usage of WithDefaultData.
   * They are only currently testing that the WithDefaultData actually works as intended so that the h2 db is cleared
   * on every test and are independent of specs. Only requirement is that tests are run in sequential order
   * but TestDBData trait should force this anyway. Sequential running is not required if each test uses own
   * db instance (different named db) but this would require some more complicated implementation.
   */
  implicit val auditUser: AuditUser = new AuditUser(null, InetAddress.getLocalHost, null, null)

  "Test" should {
    "be ok" in new WithDefaultData {
      1 mustEqual 1
    }

    "be ok too" in new WithDefaultData {
      1 mustNotEqual 2
    }

    "not find event from empty table" in new WithDefaultData {
      emailRepository.emailEvent(1l) mustEqual None
    }

    "should add new event" in new WithDefaultData {
      val testEvent: EmailEvent = EmailEvent(1l, LocalDate.now(), 1l, "testEvent")
      emailRepository.addEvent(testEvent) mustEqual Option(testEvent)
    }
  }

  "Test 2" should {
    "be ok too" in new WithDefaultData {
      1 mustEqual 1
    }

    "not find event from empty table" in new WithDefaultData {
      emailRepository.emailEvent(1l) mustEqual None
    }
  }
}
