package fi.vm.sade.vst.routes

import java.time.LocalDate
import java.time.format.DateTimeFormatter

import fi.vm.sade.vst.model._
import play.api.libs.functional.syntax._
import play.api.libs.json.{JsPath, Json, Reads, Writes}

trait JsonSupport {

  implicit val dateWrites: Writes[LocalDate] = Writes.temporalWrites[LocalDate, DateTimeFormatter](DateTimeFormatter.ofPattern("dd.MM.yyyy"))
  implicit val dateReads: Reads[LocalDate] = Reads.localDateReads("dd.MM.yyyy")

  implicit val notificationContentWrites: Writes[NotificationContent] = (
    (JsPath \ "notificationId").write[Long] and
      (JsPath \ "language").write[String] and
      (JsPath \ "title").write[String] and
      (JsPath \ "text").write[String]
    )(unlift(NotificationContent.unapply))

  implicit val tagWrites: Writes[Tag] = (
    (JsPath \ "id").write[Long] and
      (JsPath \ "name").write[String]
    )(unlift(Tag.unapply))

  implicit val notificationWrites: Writes[Notification] = (
    (JsPath \ "id").write[Long] and
      (JsPath \ "releaseId").write[Long] and
      (JsPath \ "publishDate").write[LocalDate] and
      (JsPath \ "expiryDate").write[Option[LocalDate]] and
      (JsPath \ "content").write[Map[String, NotificationContent]] and
      (JsPath \ "tags").write[List[Tag]]
    ) (unlift(Notification.unapply))

  implicit val timelineContentWrites: Writes[TimelineContent] = (
    (JsPath \ "timelineId").write[Long] and
      (JsPath \ "language").write[String] and
      (JsPath \ "text").write[String]
    )(unlift(TimelineContent.unapply))

  implicit val timelineItemWrites: Writes[TimelineItem] = (
    (JsPath \ "id").write[Long] and
      (JsPath \ "releaseId").write[Long] and
      (JsPath \ "date").write[LocalDate] and
      (JsPath \ "content").write[Map[String, TimelineContent]]
    )(unlift(TimelineItem.unapply))

  implicit val releaseWrites: Writes[Release] = (
    (JsPath \ "id").write[Long] and
      (JsPath \ "sendEmail").write[Boolean] and
      (JsPath \ "notification").write[Option[Notification]] and
      (JsPath \ "timeline").write[Seq[TimelineItem]]
    ) (unlift(Release.unapply))

  implicit val notificationContentReads: Reads[NotificationContent] = (
    (JsPath \ "notificationId").read[Long] and
      (JsPath \ "language").read[String] and
      (JsPath \ "title").read[String] and
      (JsPath \ "text").read[String]
    )(NotificationContent.apply _)

  implicit val tagReads: Reads[Tag] = (
    (JsPath \ "notificationId").read[Long] and
      (JsPath \ "name").read[String]
    )(Tag.apply _)

  implicit val NotificationReads: Reads[Notification] = (
    (JsPath \ "id").read[Long] and
      (JsPath \ "releaseId").read[Long] and
      (JsPath \ "publishDate").read[LocalDate] and
      (JsPath \ "expiryDate").readNullable[LocalDate] and
      (JsPath \ "content").read[Map[String, NotificationContent]] and
      (JsPath \ "tags").read[List [Tag]]
    )(Notification.apply _)

  implicit val timelineContentReads: Reads[TimelineContent] = (
    (JsPath \ "timelineId").read[Long] and
      (JsPath \ "language").read[String] and
      (JsPath \ "text").read[String]
    )(TimelineContent.apply _)

  implicit val timelineItemReads: Reads[TimelineItem] = (
    (JsPath \ "id").read[Long] and
      (JsPath \ "releaseId").read[Long] and
      (JsPath \ "date").read[LocalDate] and
      (JsPath \ "content").read[Map[String, TimelineContent]]
    )(TimelineItem.apply _)

  implicit val releaseReads: Reads[Release] = (
    (JsPath \ "id").read[Long] and
      (JsPath \ "sendEmail").read[Boolean] and
      (JsPath \ "notification").readNullable[Notification] and
      (JsPath \ "timeline").read[List[TimelineItem]]
    )(Release.apply _)

  def parseRelease(jsString: String): Option[Release] ={
    val jsonVal = Json.parse(jsString)
    val result = Json.fromJson(jsonVal)(releaseReads)
    val either = result.asEither
    result.asOpt
  }
}
