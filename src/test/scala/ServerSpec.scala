import java.time.LocalDate

import fi.vm.sade.vst.model.EmailEvent
import module.TestModule
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
import org.specs2.mutable.Specification
import util.TestSpecification

@RunWith(classOf[JUnitRunner])
class ServerSpec extends Specification with TestSpecification {
  "Test" should {
    "be not ok" in {
      1 mustNotEqual 2
    }

    "be ok" in new WithDefaultData {
      1 mustEqual 1
    }

    "be ok too" in new WithDefaultData {
      1 mustEqual 1
    }
  }

  "Test 2" should {
    "be ok too" in new WithDefaultData {
      1 mustEqual 1
    }
  }
}

@RunWith(classOf[JUnitRunner])
class RepositorySpec
  extends Specification
  with TestModule
  with TestSpecification {

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
