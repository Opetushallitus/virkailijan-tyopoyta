package fi.vm.sade.vst.model

import java.time.LocalDate


case class Tag(id: Long, name: String)
case class Category(id: Long, name: String)

case class NotificationContent(notificationId: Long, language: String, title: String, text: String)


case class User(lastName: String, givenNames: String, language: String, isAdmin: Boolean, groups: Seq[Kayttooikeusryhma])

case class ReleaseCategory(releaseId: Long, categoryId: Long)
case class NotificationTags(notificationId: Long, tagId: Long)


case class TimelineContent(timelineId: Long, language: String, text: String)

case class TimelineItem(id: Long,
                        releaseId: Long,
                        date: LocalDate,
                        content: Map[String, TimelineContent] = Map.empty,
                        notificationId: Option[Long] = None)

case class Timeline(month: Int, year: Int, days: Map[String,Seq[TimelineItem]] = Map.empty)

case class Release(id: Long,
                   notification: Option[Notification] = None,
                   timeline: Seq[TimelineItem] = Nil,
                   categories: Seq[Long] = Seq.empty,
                   createdBy: Int,
                   createdAt: LocalDate,
                   modifiedBy: Option[Int] = None,
                   modifiedAt: Option[LocalDate] = None,
                   deleted: Boolean = false,
                   sendEmail: Boolean = false)


case class Notification(id: Long,
                        releaseId: Long,
                        publishDate: LocalDate,
                        expiryDate: Option[LocalDate],
                        initialStartDate: Option[LocalDate],
                        content: Map[String, NotificationContent] = Map.empty,
                        tags: Seq[Long] = List.empty,
                        sendEmail: Boolean = false,
                        deleted: Boolean = false)


case class ReleaseUpdate(id: Long,
                         notification: Option[Notification] = None,
                         timeline: Seq[TimelineItem] = Nil,
                         categories: Seq[Long] = Seq.empty)


case class TimelineItemUpdate(id: Long, releaseId: Long, date: LocalDate, content: Map[String, TimelineContent] = Map.empty)

case class EmailEvent(id: Long, createdAt: LocalDate, releaseId: Long, eventType: String)

case class Kayttooikeusryhma(id: Long, name: String, description: List[KayttoikeusDescription])

case class Kayttooikeus(palveluName: String, role: String)

case class KayttoikeusDescription(text: String, lang: String)