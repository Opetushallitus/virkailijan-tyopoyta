package fi.vm.sade.vst.model

import java.time.{LocalDate, Month, MonthDay, Year}


case class Release(id: Long, sendEmail: Boolean, notification: Option[Notification] = None, timeline: Seq[TimelineItem] = Nil)

case class Notification(id: Long,
                        releaseId: Long,
                        publishDate: LocalDate,
                        expiryDate: Option[LocalDate],
                        initialStartDate: Option[LocalDate],
                        content: Map[String, NotificationContent] = Map.empty,
                        tags: List[Int] = List.empty)

case class NotificationContent(notificationId: Long, language: String, title: String, text: String)

case class Tag(id: Long, name: String)

case class NotificationTags(notificationId: Long, tagId: Long)

case class TimelineItem(id: Long, releaseId: Long, date: LocalDate, content: Map[String, TimelineContent] = Map.empty)

case class TimelineContent(timelineId: Long, language: String, text: String)

case class User(name: String, language: String, roles: Seq[String])

case class Timeline(month: Int, year: Int, days: Map[String,List[TimelineItem]] = Map.empty)
