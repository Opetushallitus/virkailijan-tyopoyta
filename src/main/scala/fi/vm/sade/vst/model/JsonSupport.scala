package fi.vm.sade.vst.model

import java.time.LocalDate
import java.time.format.DateTimeFormatter

import play.api.libs.functional.syntax._
import play.api.libs.json.{JsPath, Json, Reads, Writes}

trait JsonSupport {

  implicit val dateWrites: Writes[LocalDate] = Writes.temporalWrites[LocalDate, DateTimeFormatter](DateTimeFormatter.ofPattern("dd.MM.yyyy"))
  implicit val dateReads: Reads[LocalDate] = Reads.localDateReads("d.M.yyyy")

  implicit val notificationContentWrites: Writes[NotificationContent] = (
    (JsPath \ "notificationId").write[Long] and
      (JsPath \ "language").write[String] and
      (JsPath \ "title").write[String] and
      (JsPath \ "text").write[String]
    )(unlift(NotificationContent.unapply))

  implicit val tagWrites: Writes[Tag] = (
    (JsPath \ "id").write[Long] and
    (JsPath \ "name_fi").write[String]
    )(unlift(Tag.unapply))

  implicit val notificationWrites: Writes[Notification] = (
    (JsPath \ "id").write[Long] and
    (JsPath \ "releaseId").write[Long] and
    (JsPath \ "startDate").write[LocalDate] and
    (JsPath \ "endDate").write[Option[LocalDate]] and
    (JsPath \ "initialStartDate").write[Option[LocalDate]] and
    (JsPath \ "content").write[Map[String, NotificationContent]] and
    (JsPath \ "tags").write[List[Int]]
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
    (JsPath \ "id").read[Long] and
    (JsPath \ "name").read[String]
    )(Tag.apply _)

  implicit val NotificationReads: Reads[Notification] = (
    (JsPath \ "id").read[Long] and
    (JsPath \ "releaseId").read[Long] and
    (JsPath \ "startDate").read[LocalDate] and
    (JsPath \ "endDate").readNullable[LocalDate] and
    (JsPath \ "initialStartDate").readNullable[LocalDate] and
    (JsPath \ "content").read[Map[String, NotificationContent]] and
    (JsPath \ "tags").read[List [Int]]
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

  implicit val userWrites: Writes[User] = (
    (JsPath \ "name").write[String] and
    (JsPath \ "language").write[String] and
    (JsPath \ "roles").write[Seq[String]]
  )(unlift(User.unapply))

  def releasesReads: Reads[List[Release]] = {
    (JsPath).read[List[Release]]
  }
  def tagsReads: Reads[List[Tag]] = {
    (JsPath).read[List[Tag]]
  }

  def parseRelease(jsString: String): Option[Release] ={
    val jsonVal = Json.parse(jsString)
    val result = Json.fromJson(jsonVal)(releaseReads)
    result.asOpt
  }
  def parseReleases(jsString: String): Option[List[Release]] ={
    val jsonVal = Json.parse(jsString)
    val result = Json.fromJson(jsonVal)(releasesReads)
    result.asOpt
  }
  def parseTags(jsString: String): Option[List[Tag]] ={
    val jsonVal = Json.parse(jsString)
    val result = Json.fromJson(jsonVal)(tagsReads)
    result.asOpt
  }
  def serialize[T](obj: T)(implicit tjs: Writes[T]): String ={
    Json.toJson[T](obj).toString()
  }
}
