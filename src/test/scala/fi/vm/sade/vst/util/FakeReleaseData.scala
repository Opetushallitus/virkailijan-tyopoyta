package fi.vm.sade.vst.util

import fi.vm.sade.vst.model.{Notification, NotificationContent, Release, TimelineContent, TimelineItem}

import java.time.{LocalDate, LocalDateTime}
import scala.util.Random

// Mock-dataa EmailServiceSpecille
object FakeReleaseData {

  // Tiedotteen sisältö
  def generateNotificationContent(notificationId: Long): NotificationContent = {
    NotificationContent(
      notificationId,
      "fi",
      s"Otsikko notifikaatiolle $notificationId",
      s"Sisältö notifikaatiolle $notificationId"
    )
  }

  // Aikajanatiedotteen sisältö
  def generateTimelineContent(timelineId: Long): TimelineContent = {
    TimelineContent(
      timelineId,
      "fi",
      s"Aikajanatiedote tiedotteelle $timelineId"
    )
  }

  // Aikajanatiedote
  def generateTimelineItem(releaseId: Long, notificationId: Option[Long]): TimelineItem = {
    val timelineId = Random.nextInt(30)
    TimelineItem(
      id = timelineId,
      releaseId = releaseId,
      date = LocalDate.now(),
      content = Map("fi" -> generateTimelineContent(timelineId)),
      notificationId = notificationId
    )
  }

  // Mock-tiedote
  def generateNotification(releaseId: Long): Notification = {
    Notification(
      id = Random.nextLong(),
      releaseId = releaseId,
      publishDate = LocalDate.now(),
      expiryDate = Some(LocalDate.now().plusDays(30)),
      content = Map("fi" -> generateNotificationContent(Random.nextLong())),
      tags = Seq(Random.nextLong(), Random.nextLong()),
      categories = Seq(Random.nextLong()),
      usergroups = Seq(Random.nextLong(), Random.nextLong()),
      createdBy = "useroid",
      createdAt = LocalDateTime.now(),
      modifiedBy = None,
      modifiedAt = None
    )
  }

  // Generate fake Release
  def generateRelease: Release = {
    val releaseId = Random.nextLong()
    val notification = generateNotification(releaseId)
    Release(
      id = releaseId,
      notification = Some(generateNotification(releaseId)),
      timeline = Seq(generateTimelineItem(releaseId, Some(notification.id))),
      categories = Seq(Random.nextLong(), Random.nextLong()),
      usergroups = Seq(Random.nextLong()),
      sendEmail = true
    )
  }
}
