import fi.vm.sade.vst.model.EmailEvent
import java.time.LocalDate
import module.TestModule
import org.junit.runner.RunWith
import util.TestDBData
import org.specs2.mutable._
import org.specs2.runner.JUnitRunner

@RunWith(classOf[JUnitRunner])
class ServerSpec extends Specification with TestModule with TestDBData {
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