import java.net.InetAddress
import java.time.LocalDate

import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.model.{EmailEvent, Notification, NotificationList, User}
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
      emailRepository.emailEvent(1l) must beNone
    }

    "should add new event" in new WithDefaultData {
      emailRepository.addEvent(testEvent) mustEqual Option(testEvent)
    }

    "not find event from empty table in different test" in new WithDefaultData {
      emailRepository.emailEvent(1l) must beNone
    }
  }

  "DBReleaseRepository" should {

    "find releases" in new WithDefaultData {
      val categories: Seq[Long] = Seq.empty
      val tags: Seq[Long] = Seq.empty
      val page: Int = 1
      val user: User = User("userId", "lastname", "givennames", None, "fi", false, Seq.empty, Seq.empty)

      val notifications: NotificationList = releaseRepository.notifications(categories, tags, page, user)
      notifications.notifications should not be empty

    }

    "return releases ordered by releaseId in a descending order if they have the same releaseDate" in new WithDefaultData {
      val categories: Seq[Long] = Seq.empty
      val tags: Seq[Long] = Seq.empty
      val page: Int = 1
      val user: User = User("userId", "lastname", "givennames", None, "fi", false, Seq.empty, Seq.empty)

      val expectedDatesAndIds: Seq[(LocalDate, Long)] = Seq(
        (LocalDate.of(2016, 12, 31), 5l),
        (LocalDate.of(2016, 12, 30), 3l),
        (LocalDate.of(2016, 12, 30), 2l),
        (LocalDate.of(2016, 5, 23), 4l)
      )

      val notifications: NotificationList = releaseRepository.notifications(categories, tags, page, user)
      val res: Seq[(LocalDate, Long)] = notifications.notifications.map((n) => (n.publishDate, n.releaseId))

      res shouldEqual expectedDatesAndIds
    }
  }
}

