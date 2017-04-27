import fi.vm.sade.vst.model.EmailEvent
import java.time.LocalDate
import module.TestModule
import org.junit.runner.RunWith
import util.TestDBData
import org.specs2.mutable._
import org.specs2.runner.JUnitRunner

@RunWith(classOf[JUnitRunner])
class RepositorySpec extends Specification with TestModule with TestDBData {
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

