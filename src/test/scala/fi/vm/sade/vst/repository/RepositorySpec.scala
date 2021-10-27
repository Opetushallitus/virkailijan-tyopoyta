package fi.vm.sade.vst.repository

import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.model._
import fi.vm.sade.vst.module.TestModule
import fi.vm.sade.vst.util.TestDBData
import org.junit.runner.RunWith
import org.specs2.mutable.Specification
import org.specs2.runner.JUnitRunner

import java.net.InetAddress
import java.time.LocalDate

@RunWith(classOf[JUnitRunner])
class RepositorySpec extends Specification with TestModule with TestDBData {
  /*
   * Note:
   * These current tests in fi.vm.sade.vst.repository.RepositorySpec and ServerSpec are simply made to demonstrate the usage of WithDefaultData.
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
    val categories: Seq[Long] = Seq.empty
    val tags: Seq[Long] = Seq.empty
    val page: Int = 1
    val user: User = User("userId", Some("GL"), "fi", false, Seq.empty, Seq.empty)

    "find releases" in new WithDefaultData {
      val notifications: NotificationList = releaseRepository.notifications(categories, tags, page, user)
      notifications.notifications should not be empty

    }

    "find releases with tag id" in new WithDefaultData {
      val notifications: NotificationList = releaseRepository.notifications(categories, Seq(1), page, user)
      System.out.println("--------")
      System.out.println(notifications)
      System.out.println("--------")
      notifications.notifications.size shouldEqual 1
      notifications.notifications(0).id shouldEqual 6
    }

    "find releases with category id" in new WithDefaultData {
      val userWithKayttooikeusryhma: User = User("userId", Some("GL"), "fi", false, Seq(Kayttooikeusryhma(1,Map.empty , Seq("1"), Seq(1))), Seq.empty, Seq(1))
      val notifications: NotificationList = releaseRepository.notifications(Seq(1), tags, page, userWithKayttooikeusryhma)
      System.out.println("--------")
      System.out.println(notifications)
      System.out.println("--------")
      notifications.notifications.size shouldEqual 6
      notifications.notifications(0).id shouldEqual 7
    }

    "not find releases with category id with no kayttöoikeusryhmä" in new WithDefaultData {
      val userWithKayttooikeusryhma: User = User("userId", Some("GL"), "fi", false, Seq(Kayttooikeusryhma(1,Map.empty , Seq("2"), Seq(1))), Seq.empty, Seq(1))
      val notifications: NotificationList = releaseRepository.notifications(Seq(2), tags, page, userWithKayttooikeusryhma)
      System.out.println("--------")
      System.out.println(notifications)
      System.out.println("--------")
      notifications.notifications.size shouldEqual 5

      notifications.notifications(0).id shouldEqual 6
    }



    "return releases ordered by releaseId in a descending order if they have the same releaseDate" in new WithDefaultData {

      val expectedDatesAndIds: Seq[(LocalDate, Long)] = Seq(
        (LocalDate.of(2021, 10, 22), 6l),
        (LocalDate.of(2016, 12, 31), 5l),
        (LocalDate.of(2016, 12, 30), 3l),
        (LocalDate.of(2016, 12, 30), 2l),
        (LocalDate.of(2016, 5, 23), 4l)
      )

      val notifications: NotificationList = releaseRepository.notifications(categories, tags, page, user)
      val res: Seq[(LocalDate, Long)] = notifications.notifications.map((n) => (n.publishDate, n.releaseId))

      res shouldEqual expectedDatesAndIds
    }

    "add new release" in new WithDefaultData {

      val notificationUpdate = NotificationUpdate(123123l, 543l, LocalDate.now(), None)
      val update = ReleaseUpdate(543l, Some(notificationUpdate))

      releaseRepository.addRelease(user, update)
    }
  }
}

