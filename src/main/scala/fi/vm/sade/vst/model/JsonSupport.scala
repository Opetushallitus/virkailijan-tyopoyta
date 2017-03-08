package fi.vm.sade.vst.model

import java.time.LocalDate
import java.time.format.DateTimeFormatter

import play.api.libs.functional.syntax._
import play.api.libs.json.{JsPath, Json, Reads, Writes}

trait JsonSupport {

  implicit val dateWrites: Writes[LocalDate] = Writes.temporalWrites[LocalDate, DateTimeFormatter](DateTimeFormatter.ofPattern("dd.MM.yyyy"))
  implicit val dateReads: Reads[LocalDate] = Reads.localDateReads("d.M.yyyy")

  implicit val dateTimeReads: Reads[LocalDate] = Reads.localDateReads("d.M.yyyy HH:mm:ss")


  implicit val tagWrites: Writes[Tag] = (
    (JsPath \ "id").write[Long] and
    (JsPath \ "name").write[String] and
    (JsPath \ "type").write[Option[String]]
    )(unlift(Tag.unapply))

  implicit val timelineContentReads: Reads[TimelineContent] = (
    (JsPath \ "timelineId").read[Long] and
      (JsPath \ "language").read[String] and
      (JsPath \ "text").read[String]
    )(TimelineContent.apply _)

  implicit val timelineContentWrites: Writes[TimelineContent] = (
    (JsPath \ "timelineId").write[Long] and
      (JsPath \ "language").write[String] and
      (JsPath \ "text").write[String]
    )(unlift(TimelineContent.unapply))

  implicit val timelineItemReads: Reads[TimelineItem] = (
    (JsPath \ "id").read[Long] and
      (JsPath \ "releaseId").read[Long] and
      (JsPath \ "date").read[LocalDate](dateReads)and
      (JsPath \ "content").read[Map[String, TimelineContent]] and
      (JsPath \ "notificationId").readNullable[Long]
    )(TimelineItem.apply _)

  implicit val timelineItemWrites: Writes[TimelineItem] = (
    (JsPath \ "id").write[Long] and
      (JsPath \ "releaseId").write[Long] and
      (JsPath \ "date").write[LocalDate] and
      (JsPath \ "content").write[Map[String, TimelineContent]] and
      (JsPath \ "notificationId").write[Option[Long]]
    )(unlift(TimelineItem.unapply))

  implicit val timelineWrites: Writes[Timeline] = (
    (JsPath \ "month").write[Int] and
      (JsPath \ "year").write[Int] and
      (JsPath \ "days").write[Map[String,Seq[TimelineItem]]]
    )(unlift(Timeline.unapply))


  implicit val releaseWrites: Writes[Release] = Writes { release =>
    Json.obj(
      "id" -> release.id,
      "notification" -> release.notification,
      "timeline" -> release.timeline,
      "categories" -> release.categories
    )
  }

  implicit val notificationContentReads: Reads[NotificationContent] = (
    (JsPath \ "notificationId").read[Long] and
    (JsPath \ "language").read[String] and
    (JsPath \ "title").read[String] and
    (JsPath \ "text").read[String]
    )(NotificationContent.apply _)

  implicit val notificationContentWrites: Writes[NotificationContent] = (
    (JsPath \ "notificationId").write[Long] and
      (JsPath \ "language").write[String] and
      (JsPath \ "title").write[String] and
      (JsPath \ "text").write[String]
    )(unlift(NotificationContent.unapply))

  implicit val tagReads: Reads[Tag] = (
    (JsPath \ "id").read[Long] and
    (JsPath \ "name").read[String] and
    (JsPath \ "type").readNullable[String]
    )(Tag.apply _)

  implicit val notificationReads: Reads[NotificationUpdate] = (
      (JsPath \ "id").read[Long] and
      (JsPath \ "releaseId").read[Long] and
      (JsPath \ "startDate").read[LocalDate](dateReads) and
      (JsPath \ "endDate").readNullable[LocalDate](dateReads) and
      (JsPath \ "content").read[Map[String, NotificationContent]] and
      (JsPath \ "tags").read[Seq[Long]] and
      Reads.pure(false)
    )(NotificationUpdate.apply _)

  implicit val notificationWrites: Writes[Notification] = Writes { notification =>
    Json.obj(
      "id" -> notification.id,
      "releaseId" -> notification.releaseId,
      "startDate" -> notification.publishDate,
      "endDate" -> notification.expiryDate,
      "createdBy" -> notification.createdBy,
      "createdAt" -> notification.createdAt,
      "content" -> notification.content,
      "tags" -> notification.tags,
      "categories" -> notification.categories
    )
  }

  implicit val notificationListWrites: Writes[NotificationList] = Writes { notificationList =>
    Json.obj(
      "count" -> notificationList.totalAmount,
      "items" -> notificationList.notifications
    )
  }

  implicit val releaseUpdateReads: Reads[ReleaseUpdate] = (
    (JsPath \ "id").read[Long] and
    (JsPath \ "notification").readNullable[NotificationUpdate] and
    (JsPath \ "timeline").read[List[TimelineItem]] and
    (JsPath \ "categories").read[List[Long]]
  )(ReleaseUpdate.apply _)

  implicit val categoryWrites: Writes[Category] = (
    (JsPath \ "id").write[Long] and
    (JsPath \ "name").write[String]
    )(unlift(Category.unapply))

  implicit val categoryReads: Reads[Category] = (
    (JsPath \ "id").read[Long] and
    (JsPath \ "name").read[String]
  )(Category.apply _)

  implicit val kayttoikeusDescriptionReads: Reads[KayttoikeusDescription] = (
    (JsPath \ "text").readNullable[String] and
    (JsPath \ "lang").read[String]
  )(KayttoikeusDescription.apply _)

   val kayttooikeusryhmaReads: Reads[Kayttooikeusryhma] = (
    (JsPath \ "id").read[Long] and
    (JsPath \ "description" \ "texts").read[List[KayttoikeusDescription]].map(desc => desc.groupBy(_.lang).transform((l, d) => d.head.text))
  )(Kayttooikeusryhma.apply _)

   val userKayttooikeusryhmaReads: Reads[Kayttooikeusryhma] = (
    (JsPath \ "ryhmaId").read[Long] and
    (JsPath \ "ryhmaNames" \ "texts").read[List[KayttoikeusDescription]].map(desc => desc.groupBy(_.lang).transform((l, d) => d.head.text))
    )(Kayttooikeusryhma.apply _)

  implicit val kayttooikeusryhmaWrites: Writes[Kayttooikeusryhma] = Writes { group =>
    Json.obj(
      "id" -> group.id,
      "description" -> group.description
    )
  }

  implicit val kayttooikeusReads: Reads[Kayttooikeus] = (
    (JsPath \ "palveluName").read[String] and
    (JsPath \ "rooli").read[String]
  )(Kayttooikeus.apply _)

  implicit val userWrites: Writes[User] = Writes { user =>
    Json.obj(
      "lang" -> user.language,
      "isAdmin" -> user.isAdmin,
      "groups" -> user.groups,
      "profile" -> user.profile
    )
  }

  def readKayttooikeusryhmat(user: Boolean): Reads[List[Kayttooikeusryhma]] = {
    implicit  val reads = if(user) userKayttooikeusryhmaReads else  kayttooikeusryhmaReads

    JsPath.read[List[Kayttooikeusryhma]]
  }

  def readKayttooikeudet: Reads[List[Kayttooikeus]] = JsPath.read[List[Kayttooikeus]]

  implicit val userProfileWrites: Writes[UserProfile] = (
    (JsPath \ "uid").write[String] and
    (JsPath \ "categories").write[Seq[Long]] and
    (JsPath \ "sendEmail").write[Boolean]
    )(unlift(UserProfile.unapply))

  implicit val userProfileReads: Reads[UserProfileUpdate] = (
      (JsPath \ "categories").read[Seq[Long]] and
      (JsPath \ "sendEmail").read[Boolean]
    )(UserProfileUpdate.apply _)

  def parseReleaseUpdate(jsString: String): Option[ReleaseUpdate] ={
    val jsonVal = Json.parse(jsString)
    val result = Json.fromJson(jsonVal)(releaseUpdateReads)
    result.asOpt
  }

  def parseUserProfileUpdate(jsString: String): Option[UserProfileUpdate] ={
    val jsonVal = Json.parse(jsString)
    val result = Json.fromJson(jsonVal)(userProfileReads)
    result.asOpt
  }
//  def parseReleases(jsString: String): Option[List[Release]] ={
//    val jsonVal = Json.parse(jsString)
//    val result = Json.fromJson(jsonVal)(releasesReads)
//    result.asOpt
//  }
//  def parseTags(jsString: String): Option[List[Tag]] ={
//    val jsonVal = Json.parse(jsString)
//    val result = Json.fromJson(jsonVal)(tagsReads)
//    result.asOpt
//  }

  def parseKayttooikeusryhmat(jsString: String, forUser: Boolean): Option[List[Kayttooikeusryhma]] = {
    val jsonVal = Json.parse(jsString)
    Json.fromJson(jsonVal)(readKayttooikeusryhmat(forUser)).asOpt
  }

  def parseKayttooikedet(jsString: String): Option[List[Kayttooikeus]] = {
    val jsonVal = Json.parse(jsString)
    Json.fromJson(jsonVal)(readKayttooikeudet).asOpt
  }

  def serialize[T](obj: T)(implicit tjs: Writes[T]): String ={
    Json.toJson[T](obj).toString()
  }
}
