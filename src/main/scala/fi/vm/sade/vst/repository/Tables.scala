package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model._
import scalikejdbc._
import scalikejdbc.jsr310._

/**
  * Created by outa on 17/02/2017.
  */
object Tables {
  object NotificationTable extends SQLSyntaxSupport[Notification]{
    override val tableName = "notification"
    def apply(n: SyntaxProvider[Notification])(rs: WrappedResultSet): Notification = apply(n.resultName)(rs)
    def apply(n: ResultName[Notification])(rs: WrappedResultSet): Notification =
      Notification(id = rs.get(n.id),
        releaseId = rs.get(n.releaseId),
        publishDate = rs.localDate(n.publishDate),
        expiryDate = None,
        initialStartDate = None)
    def opt(n: SyntaxProvider[Notification])(rs: WrappedResultSet): Option[Notification] =
      rs.longOpt(n.resultName.releaseId).map(_ => NotificationTable(n)(rs))
  }

  object NotificationContentTable extends SQLSyntaxSupport[NotificationContent]{
    override val tableName = "notification_content"
    def apply(n: SyntaxProvider[NotificationContent])(rs: WrappedResultSet): NotificationContent = apply(n.resultName)(rs)
    def apply(n: ResultName[NotificationContent])(rs: WrappedResultSet): NotificationContent =
      NotificationContent(rs.get(n.notificationId), rs.get(n.language), rs.get(n.title), rs.get(n.text))

    def opt(c: SyntaxProvider[NotificationContent])(rs: WrappedResultSet): Option[NotificationContent] =
      rs.longOpt(c.resultName.notificationId).map(_ => NotificationContentTable(c)(rs))
  }

  object TagTable extends SQLSyntaxSupport[Tag]{
    override val tableName = "tag"
    def apply(t: SyntaxProvider[Tag])(rs: WrappedResultSet): Tag = apply(t.resultName)(rs)
    def apply(t: ResultName[Tag])(rs: WrappedResultSet): Tag = Tag(rs.get(t.id), rs.get(t.name))

    def opt(t: SyntaxProvider[Tag])(rs: WrappedResultSet): Option[Tag] =
      rs.longOpt(t.resultName.id).map(_ => TagTable(t)(rs))
  }

  object NotificationTagTable extends SQLSyntaxSupport[NotificationTags]{
    override val tableName = "notification_tag"
    def apply(n: SyntaxProvider[NotificationTags])(rs: WrappedResultSet): NotificationTags = apply(n.resultName)(rs)
    def apply(n: ResultName[NotificationTags])(rs: WrappedResultSet): NotificationTags =
      NotificationTags(rs.get(n.notificationId), rs.get(n.tagId))

    def opt(c: SyntaxProvider[NotificationTags])(rs: WrappedResultSet): Option[NotificationTags] =
      rs.longOpt(c.resultName.tagId).map(_ => NotificationTagTable(c)(rs))
  }

  object ReleaseTable extends SQLSyntaxSupport[Release]{
    override val tableName = "release"
    def apply(n: SyntaxProvider[Release])(rs: WrappedResultSet): Release = apply(n.resultName)(rs)
    def apply(r: ResultName[Release])(rs: WrappedResultSet): Release = Release(
      id = rs.get(r.id),
      createdBy = rs.get(r.createdBy),
      createdAt = rs.get(r.createdAt))
  }

  object TimelineTable extends SQLSyntaxSupport[TimelineItem]{
    override val tableName = "timeline_item"
    def apply(tl: SyntaxProvider[TimelineItem])(rs: WrappedResultSet): TimelineItem = apply(tl.resultName)(rs)
    def apply(tl: ResultName[TimelineItem])(rs:WrappedResultSet): TimelineItem = TimelineItem(rs.get(tl.id), rs.get(tl.releaseId), rs.get(tl.date))

    def opt(tl: SyntaxProvider[TimelineItem])(rs: WrappedResultSet): Option[TimelineItem] =
      rs.longOpt(tl.resultName.id).map(_ => TimelineTable(tl)(rs))
  }

  object TimelineContentTable extends SQLSyntaxSupport[TimelineContent]{
    override val tableName = "timeline_content"
    def apply(c: SyntaxProvider[TimelineContent])(rs: WrappedResultSet): TimelineContent = apply(c.resultName)(rs)
    def apply(c: ResultName[TimelineContent])(rs: WrappedResultSet): TimelineContent =
      TimelineContent(rs.get(c.timelineId), rs.get(c.language), rs.get(c.text))
    def opt(c: SyntaxProvider[TimelineContent])(rs: WrappedResultSet): Option[TimelineContent] =
      rs.longOpt(c.resultName.timelineId).map(_ => TimelineContentTable(c)(rs))
  }

  object CategoryTable extends SQLSyntaxSupport[Category]{
    override val tableName = "category"
    def apply (cat: SyntaxProvider[Category])(rs: WrappedResultSet): Category = apply(cat.resultName)(rs)
    def apply (cat: ResultName[Category])(rs: WrappedResultSet): Category =
      Category(rs.get(cat.id), rs.get(cat.name))
    def opt(cat: SyntaxProvider[Category])(rs: WrappedResultSet): Option[Category] =
      rs.longOpt(cat.resultName.id).map(_ => CategoryTable(cat)(rs))
  }

  object ReleaseCategoryTable extends SQLSyntaxSupport[ReleaseCategory]{
    override val tableName = "release_category"
    def apply(n: SyntaxProvider[ReleaseCategory])(rs: WrappedResultSet): ReleaseCategory = apply(n.resultName)(rs)
    def apply(n: ResultName[ReleaseCategory])(rs: WrappedResultSet): ReleaseCategory =
      ReleaseCategory(rs.get(n.releaseId), rs.get(n.categoryId))

    def opt(c: SyntaxProvider[ReleaseCategory])(rs: WrappedResultSet): Option[ReleaseCategory] =
      rs.longOpt(c.resultName.categoryId).map(_ => ReleaseCategoryTable(c)(rs))
  }

  object EmailEventTable extends SQLSyntaxSupport[EmailEvent] {
    override val tableName = "email_event"
    def apply(n: SyntaxProvider[EmailEvent])(rs: WrappedResultSet): EmailEvent = apply(n.resultName)(rs)
    def apply(n: ResultName[EmailEvent])(rs: WrappedResultSet): EmailEvent = {
      EmailEvent(id = rs.get(n.id),
        createdAt = rs.get(n.createdAt),
        releaseId = rs.get(n.releaseId),
        eventType = rs.get(n.eventType)
      )
    }
  }

  object UserProfileTable extends SQLSyntaxSupport[UserProfile]{
    override val tableName = "user_profile"
    def apply(n: SyntaxProvider[UserProfile])(rs: WrappedResultSet): UserProfile = apply(n.resultName)(rs)
    def apply(r: ResultName[UserProfile])(rs: WrappedResultSet): UserProfile = UserProfile(
      id = rs.get(r.id),
      uid = rs.get(r.uid),
      sendEmail = rs.get(r.sendEmail)
    )
  }

  object UserCategoryTable extends SQLSyntaxSupport[UserCategory]{
    override val tableName = "user_category"
    def apply(n: SyntaxProvider[UserCategory])(rs: WrappedResultSet): UserCategory = apply(n.resultName)(rs)
    def apply(r: ResultName[UserCategory])(rs: WrappedResultSet): UserCategory = UserCategory(
      userId = rs.get(r.userId),
      categoryId = rs.get(r.categoryId)
    )

    def opt(c: SyntaxProvider[UserCategory])(rs: WrappedResultSet): Option[UserCategory] =
      rs.longOpt(c.resultName.categoryId).map(_ => UserCategoryTable(c)(rs))
  }

}
