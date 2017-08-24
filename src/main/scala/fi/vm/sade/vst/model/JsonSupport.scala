package fi.vm.sade.vst.model

import java.time.LocalDate
import java.time.format.DateTimeFormatter

import play.api.libs.functional.syntax._
import play.api.libs.json._

trait JsonSupport {

  implicit val dateWrites: Writes[LocalDate] = Writes.temporalWrites[LocalDate, DateTimeFormatter](DateTimeFormatter.ofPattern("dd.MM.yyyy"))
  implicit val dateReads: Reads[LocalDate] = Reads.localDateReads("d.M.yyyy")

  implicit val dateTimeReads: Reads[LocalDate] = Reads.localDateReads("d.M.yyyy HH:mm:ss")

  implicit val tagWrites: Writes[Tag] = Writes { tag =>
    Json.obj(
      "id" -> tag.id,
      "name" -> tag.name,
      "type" -> tag.tagType
    )
  }

  implicit val tagGroupWrites: Writes[TagGroup] = Writes {tagGroup =>
    Json.obj(
      "id" -> tagGroup.id,
      "name" -> tagGroup.name,
      "tags" -> tagGroup.tags,
      "categories" -> tagGroup.categories
    )
  }

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
      "categories" -> release.categories,
      "userGroups" -> release.usergroups
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

  implicit val notificationReads: Reads[NotificationUpdate] = (
      (JsPath \ "id").read[Long] and
      (JsPath \ "releaseId").read[Long] and
      (JsPath \ "startDate").read[LocalDate](dateReads) and
      (JsPath \ "endDate").readNullable[LocalDate](dateReads) and
      (JsPath \ "content").read[Map[String, NotificationContent]] and
      (JsPath \ "tags").read[Seq[Long]] and
      (JsPath \ "sendEmail").read[Boolean]
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
      "categories" -> notification.categories,
      "sendEmail" -> false
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
    (JsPath \ "categories").read[List[Long]] and
    (JsPath \ "userGroups").read[List[Long]]
  )(ReleaseUpdate.apply _)

  implicit val categoryWrites: Writes[Category] = Writes { category =>
    Json.obj(
      "id" -> category.id,
      "name" -> category.name
    )
  }

  implicit val kayttoikeusDescriptionReads: Reads[KayttoikeusDescription] = (
    (JsPath \ "text").readNullable[String] and
    (JsPath \ "lang").read[String]
  )(KayttoikeusDescription.apply _)

   val kayttooikeusryhmaReads: Reads[Kayttooikeusryhma] = (
    (JsPath \ "id").read[Long] and
    (JsPath \ "name").read[String] and
    (JsPath \ "description" \ "texts").read[List[KayttoikeusDescription]].map(desc => desc.groupBy(_.lang).transform((l, d) => d.head.text)) and
    (JsPath \ "tila").readNullable[String] and
    Reads.pure(Seq.empty) and
    Reads.pure(Seq.empty)
  )(Kayttooikeusryhma.apply _)

   val userKayttooikeusryhmaReads: Reads[Kayttooikeusryhma] = (
    (JsPath \ "ryhmaId").read[Long] and
    (JsPath \ "tehtavanimike").read[String] and
    (JsPath \ "ryhmaNames" \ "texts").read[List[KayttoikeusDescription]].map(desc => desc.groupBy(_.lang).transform((l, d) => d.head.text)) and
    (JsPath \ "tila").readNullable[String] and
    Reads.pure(Seq.empty) and
    Reads.pure(Seq.empty)
    )(Kayttooikeusryhma.apply _)

  implicit val kayttooikeusryhmaWrites: Writes[Kayttooikeusryhma] = Writes { group =>
    Json.obj(
      "id" -> group.id,
      "description" -> group.description,
      "categories" -> group.categories
    )
  }

  implicit val kayttooikeusReads: Reads[Kayttooikeus] = (
    (JsPath \ "palveluName").read[String] and
    (JsPath \ "rooli").read[String]
  )(Kayttooikeus.apply _)

  implicit val userWrites: Writes[User] = Writes { user =>
    Json.obj(
      "lang" -> user.language,
      "userId" -> user.userId,
      "isAdmin" -> user.isAdmin,
      "groups" -> user.groups,
      "profile" -> user.profile,
      "draft" -> user.draft.map(_.data)
    )
  }

  implicit val emailEventWrites: Writes[EmailEvent] = Writes { emailEvent =>
    Json.obj(
      "id" -> emailEvent.id,
      "createdAt" -> emailEvent.createdAt,
      "releaseId" -> emailEvent.releaseId,
      "eventType" -> emailEvent.eventType
    )
  }

  def readKayttooikeusryhmat(user: Boolean): Reads[List[Kayttooikeusryhma]] = {
    implicit val reads: Reads[Kayttooikeusryhma] = if (user) userKayttooikeusryhmaReads else  kayttooikeusryhmaReads

    JsPath.read[List[Kayttooikeusryhma]]
  }

  def readKayttooikeudet: Reads[List[Kayttooikeus]] = JsPath.read[List[Kayttooikeus]]

  implicit val userProfileWrites: Writes[UserProfile] = Writes { profile =>
    Json.obj(
      "categories" -> profile.categories,
      "sendEmail" -> profile.sendEmail,
      "firstLogin" -> profile.firstLogin
    )
  }

  implicit val userProfileReads: Reads[UserProfileUpdate] = (
      (JsPath \ "categories").read[Seq[Long]] and
      (JsPath \ "email").read[Boolean]
    )(UserProfileUpdate.apply _)

  implicit val targetingGroupReads: Reads[TargetingGroupUpdate] = (
    (JsPath \ "name").read[String] and
    (JsPath \ "data").read[String]
    )(TargetingGroupUpdate.apply _)

  implicit val targetingGroupWrites: Writes[TargetingGroup] = Writes { group =>
    Json.obj(
      "id" -> group.id,
      "name" -> group.name,
      "data" -> group.data
    )
  }

  implicit val userLanguageReads: Reads[UserLanguage] = Json.reads[UserLanguage]

  implicit val userContactInformationReads: Reads[UserContactInformation] = Json.reads[UserContactInformation]

  implicit val userContactInformationGroupReads: Reads[UserContactInformationGroup] = Json.reads[UserContactInformationGroup]

  implicit val userInformationReads: Reads[UserInformation] = Json.reads[UserInformation]

  def parseSingleUserInformation(jsonVal: JsValue): Option[UserInformation] = Json.fromJson(jsonVal)(userInformationReads).asOpt

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

  def parseKayttooikeusryhmat(jsString: String, forUser: Boolean): Option[List[Kayttooikeusryhma]] = {
    val jsonVal = Json.parse(jsString)
    Json.fromJson(jsonVal)(readKayttooikeusryhmat(forUser)).asOpt
  }

  def parseKayttooikedet(jsString: String): Option[List[Kayttooikeus]] = {
    val jsonVal = Json.parse(jsString)
    Json.fromJson(jsonVal)(readKayttooikeudet).asOpt
  }

  def parseTargetingGroup(jsString: String): Option[TargetingGroupUpdate] = {
    val jsonVal: JsValue = Json.parse(jsString)
    val name = (jsonVal \ "name").asOpt[String]
    val data = jsonVal \ "data"
    (name, data) match {
      case (Some(n), JsDefined(d)) => Some(TargetingGroupUpdate(n, d.toString()))
      case _ => None
    }
  }

  def serialize[T](obj: T)(implicit tjs: Writes[T]): String ={
    Json.toJson[T](obj).toString()
  }
}
