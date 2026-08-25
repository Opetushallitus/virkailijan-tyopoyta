package fi.vm.sade.vst.logging

import java.time.LocalDate

import scala.collection.JavaConverters._

import fi.vm.sade.auditlog.Changes
import fi.vm.sade.vst.model.{NotificationUpdate, ReleaseUpdate}
import org.junit.runner.RunWith
import org.specs2.mutable._
import org.specs2.runner.JUnitRunner
import play.api.libs.json.Json.toJson


@RunWith(classOf[JUnitRunner])
class AuditLogTest extends Specification with AuditLogging {

  "Logging" should {
    "correctly create Changes from newly created objects" in {
      val releaseUpdate = ReleaseUpdate(
        id = 1,
        notification = None,
        timeline = Nil,
        categories = Seq(1, 2, 3),
        userGroups = Seq(4)
      )

      val generatedChanges: Changes = toNewChanges(toJson(releaseUpdate))

      val manualChanges: Changes = new Changes.Builder()
        .added("id", releaseUpdate.id.toString)
        .added("notification", releaseUpdate.notification.map(toJson(_).toString()).getOrElse("null"))
        .added("categories", toJson(releaseUpdate.categories).toString)
        .added("timeline", toJson(releaseUpdate.timeline).toString)
        .added("userGroups", toJson(releaseUpdate.userGroups).toString)
        .build()

      changeSet(generatedChanges) must_== changeSet(manualChanges)
    }


    "correctly create Changes from objects with removed fields" in {
      val oldNotification = NotificationUpdate(
        id = 2,
        releaseId = 1,
        publishDate = LocalDate.now(),
        expiryDate = None
      )

      val oldReleaseUpdate = ReleaseUpdate(
        id = 1,
        notification = Some(oldNotification),
        timeline = Nil,
        categories = Seq(1, 2, 3),
        userGroups = Seq(4)
      )

      val newReleaseUpdate = ReleaseUpdate(
        id = 1,
        categories = Seq(1, 2, 3),
        userGroups = Seq(4, 5)
      )

      val oldJson = toJson(oldReleaseUpdate)
      val newJson = toJson(newReleaseUpdate)
      val generatedChanges: Changes = toDeltaChanges(oldJson, newJson)

      val manualChanges: Changes = new Changes.Builder()
        .updated("notification", toJson(oldNotification).toString, "null")
        .updated("userGroups", "[4]", "[4,5]")
        .build()

      changeSet(generatedChanges) must_== changeSet(manualChanges)
    }


    "correctly create Changes from objects with added and changed fields" in {
      val oldReleaseUpdate = ReleaseUpdate(
        id = 1,
        timeline = Nil,
        categories = Seq(1, 2)
      )

      val newNotification = NotificationUpdate(
        id = 2,
        releaseId = 1,
        publishDate = LocalDate.now(),
        expiryDate = None
      )

      val newReleaseUpdate = ReleaseUpdate(
        id = 1,
        notification = Some(newNotification),
        timeline = Nil,
        categories = Seq(1, 2, 3),
        userGroups = Seq(4, 5)
      )

      val oldJson = toJson(oldReleaseUpdate)
      val newJson = toJson(newReleaseUpdate)
      val generatedChanges: Changes = toDeltaChanges(oldJson, newJson)

      val manualChanges: Changes = new Changes.Builder()
        .updated("notification", "null", toJson(newNotification).toString)
        .updated("categories", "[1,2]", "[1,2,3]")
        .updated("userGroups", "[]", "[4,5]")
        .build()

      changeSet(generatedChanges) must_== changeSet(manualChanges)
    }


    "correctly create Changes from deltas in nested objects" in {
      val oldNotification = NotificationUpdate(
        id = 2,
        releaseId = 1,
        publishDate = LocalDate.now(),
        expiryDate = None
      )

      val oldReleaseUpdate = ReleaseUpdate(
        id = 1,
        notification = Some(oldNotification),
        timeline = Nil,
        categories = Seq(1, 2, 3)
      )

      val newNotification = oldNotification.copy(releaseId = 9)
      val newReleaseUpdate = oldReleaseUpdate.copy(notification = Some(newNotification))

      val oldJson = toJson(oldReleaseUpdate)
      val newJson = toJson(newReleaseUpdate)
      val generatedChanges: Changes = toDeltaChanges(oldJson, newJson)

      val manualChanges: Changes = new Changes.Builder()
        .updated("notification", toJson(oldNotification).toString, toJson(newNotification).toString)
        .build()

      changeSet(generatedChanges) must_== changeSet(manualChanges)
    }
  }

  // Changes.asJsonArray is order-sensitive, but the order of entries in an audit
  // changes list is incidental (it follows play-json's field order), so compare as sets.
  private def changeSet(changes: Changes): Set[String] =
    changes.asJsonArray().iterator().asScala.map(_.toString).toSet
}
