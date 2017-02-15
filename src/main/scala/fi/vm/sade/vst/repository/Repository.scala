package fi.vm.sade.vst.repository

import java.time.{LocalDate, YearMonth}

import fi.vm.sade.vst.DBConfig
import fi.vm.sade.vst.model._
import scalikejdbc._
import jsr310._

import scala.collection.immutable.Seq
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


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
class DBReleaseRepository(config: DBConfig) extends ReleaseRepository{

  Class.forName("org.postgresql.Driver")
  ConnectionPool.singleton(config.url, config.username, config.password)

  private val pageLength: Int = config.pageLength

  private def offset(page: Int) = math.max(page-1, 0) * pageLength

  implicit val session = AutoSession

  val (r, n, c, nt, t, tl, tc) =
    (ReleaseTable.syntax, NotificationTable.syntax, NotificationContentTable.syntax, NotificationTagTable.syntax, TagTable.syntax, TimelineTable.syntax, TimelineContentTable.syntax)

  val (cat, rc) = (CategoryTable.syntax, ReleaseCategoryTable.syntax)


  private def findRelease(id: Long): Option[Release] =
    withSQL[Release]{
      select
        .from(ReleaseTable as r)
        .leftJoin(ReleaseCategoryTable as rc).on(r.id, rc.releaseId)
        .where.eq(r.id, id)
    }.one(ReleaseTable(r))
      .toMany(
        rs => ReleaseCategoryTable.opt(rc)(rs)
      ).map( (release, categories) => release.copy(categories = categories.map(_.categoryId)))
    .single.apply()

  private def notificationForRelease(release: Release): Option[Notification] =
    withSQL[Notification]{
      select
        .from(NotificationTable as n)
        .leftJoin(NotificationContentTable as c).on(n.id, c.notificationId)
        .leftJoin(NotificationTagTable as nt).on(n.id, nt.notificationId)
        .where.eq(n.releaseId, release.id)
    }
      .one(NotificationTable(n))
      .toManies(
        rs => NotificationContentTable.opt(c)(rs),
        rs => NotificationTagTable.opt(nt)(rs))
      .map{ (notification, content, tags) => notification.copy(
        content = content.groupBy(_.language).transform((_,v) => v.head),
        tags = tags.map(_.tagId))}
      .single
      .apply()

  private def timelineForRelease(release: Release): Seq[TimelineItem] =
    withSQL[TimelineItem] {
      select
        .from(TimelineTable as tl)
        .leftJoin(TimelineContentTable as tc).on(tl.id, tc.timelineId)
        .where.eq(tl.releaseId, release.id)
    }
      .one(TimelineTable(tl))
        .toMany(
          rs => TimelineContentTable.opt(tc)(rs))
        .map{ (timelineItem, timelineContent) => timelineItem.copy(
          content = timelineContent.groupBy(_.language).transform((_,v) => v.head)
      )}.list.apply()


  private def listNotifications(categories: RowIds, tags: RowIds, page: Int): Seq[Notification] = {
    val sql = withSQL[Release] {
      select
        .from(ReleaseTable as r)
        .leftJoin(ReleaseCategoryTable as rc).on(r.id, rc.releaseId)
        .innerJoin(NotificationTable as n).on(r.id, n.releaseId)
        .leftJoin(NotificationContentTable as c).on(n.id, c.notificationId)
        .leftJoin(NotificationTagTable as nt).on(n.id, nt.notificationId)
        .where.not.gt(n.publishDate, LocalDate.now())
        .and.withRoundBracket{_.gt(n.expiryDate, LocalDate.now()).or.isNull(n.expiryDate)}
        .and.eq(r.deleted, false).and.eq(n.deleted, false)
        .and(sqls.toAndConditionOpt(
          tags.map(t => sqls.in(nt.tagId, t)),
          categories.map(categories => sqls.in(rc.categoryId, categories))
        ))
        .limit(pageLength)
        .offset(offset(page))
    }
    sql.one(ReleaseTable(r)).toManies(
      rs => NotificationTable.opt(n)(rs),
      rs => NotificationContentTable.opt(c)(rs),
      rs => NotificationTagTable.opt(nt)(rs)).map {
      (_, notifications, content, tags) =>
        notifications.headOption.map(n => n.copy(
          content = content.groupBy(_.language).transform((_, v) => v.head),
          tags = tags.map(_.tagId)))
    }.list.apply().flatten
  }

  private def listTimeline(categories: RowIds, month: YearMonth): Seq[TimelineItem] = {

    val startDate = month.atDay(1)
    val endDate = month.atEndOfMonth()

    val sql = withSQL[Release] {
       select
        .from(ReleaseTable as r)
        .leftJoin(ReleaseCategoryTable as rc).on(r.id, rc.releaseId)
        .join(TimelineTable as tl).on(r.id, tl.releaseId)
        .join(NotificationTable as n).on(r.id, n.releaseId)
        .leftJoin(TimelineContentTable as tc).on(tl.id, tc.timelineId)
        .where(sqls.toAndConditionOpt(
          categories.map(cs => sqls.in(rc.categoryId, cs))
        ))
        .and.between(tl.date, startDate, endDate)
    }

    sql.one(ReleaseTable(r)).toManies(
      rs => TimelineTable.opt(tl)(rs),
      rs => TimelineContentTable.opt(tc)(rs))
      .map {
        (rel, timeline, content) =>  timeline.map(tl =>
        tl.copy(content = content.filter(_.timelineId == tl.id).groupBy(_.language).transform((_, v) => v.head),
                notificationId = rel.notification.map(_.id))
      )
    }.list.apply().flatten
  }


  def tags(): Future[Seq[Tag]] = Future{withSQL{select.from(TagTable as t)}.map(TagTable(t)).list.apply}

  def categories(): Future[Seq[Category]] = Future {
    withSQL{select.from(CategoryTable as cat)}.map(CategoryTable(cat)).list.apply
  }

  override def notifications(categories: RowIds, tags: RowIds, page: Int): Future[Seq[Notification]] = {
    Future{
      listNotifications(categories, tags, page)
    }
  }

  override def timeline(categories: RowIds, month: YearMonth): Future[Timeline] = {
    Future{
      val timeline = listTimeline(categories, month)
      val grouped: (Timeline, Seq[TimelineItem]) = timeline.groupBy(tl => Timeline(tl.date.getMonthValue, tl.date.getYear)).head

      grouped._1.copy(days = grouped._2.groupBy(_.date.toString))
    }
  }

  def release(id: Long): Future[Option[Release]] = {
    Future {
      val release = findRelease(id)

      release.map(r => r.copy(
        notification = notificationForRelease(r),
        timeline = timelineForRelease(r)))
    }
  }

  private def insertRelease(releaseUpdate: ReleaseUpdate): Long = {
    val r = ReleaseTable.column
    withSQL {
      insert.into(ReleaseTable).namedValues(
        r.createdBy -> 0,
        r.createdAt -> LocalDate.now()
      )
    }.updateAndReturnGeneratedKey().apply()
  }

  private def insertNotification(releaseId: Long, notification: Notification): Long ={
    val n = NotificationTable.column
    withSQL {
      insert.into(NotificationTable).namedValues(
        n.releaseId -> releaseId,
        n.publishDate -> notification.publishDate,
        n.expiryDate -> notification.publishDate
      )
    }.updateAndReturnGeneratedKey().apply()
  }

  private def insertNotificationContent(notificationId: Long, content: NotificationContent) = {
    val nc = NotificationContentTable.column
    withSQL {
      insert.into(NotificationContentTable).namedValues(
        nc.notificationId -> notificationId,
        nc.language -> content.language,
        nc.text -> content.text,
        nc.title -> content.title
      )
    }.update().apply()
  }

  private def addNotification(releaseId: Long, notification: Notification): Long = {
      val notificationId: Long = insertNotification(releaseId, notification)
      notification.content.values.map(insertNotificationContent(notificationId, _))
      notificationId
  }

  private def insertTimelineItem(releaseId: Long, item: TimelineItem): Long = {
    val t = TimelineTable.column
    withSQL {
      insert.into(TimelineTable).namedValues(
        t.releaseId -> item.releaseId,
        t.date -> item.date
      )
    }.updateAndReturnGeneratedKey().apply()
  }

  private def insertTimelineContent(itemId: Long, content: TimelineContent): Unit ={
    val tc = TimelineContentTable.column
   withSQL{
      insert.into(TimelineContentTable).namedValues(
        tc.timelineId -> itemId,
        tc.language -> content.language,
        tc.text -> content.text
      )
    }.update.apply()
  }

  private def addTimelineItem(releaseId: Long, item: TimelineItem, notificationId: Option[Long]): Unit = {
      val itemId = insertTimelineItem(releaseId, item)
      item.content.values.foreach(insertTimelineContent(itemId, _))
  }

  override def addRelease(releaseUpdate: ReleaseUpdate): Future[Release] = {
      DB futureLocalTx { implicit session => {
        Future {

          val releaseId = insertRelease(releaseUpdate)
          val notificationId = releaseUpdate.notification.map(addNotification(releaseId, _))
          releaseUpdate.timeline.foreach(addTimelineItem(releaseId, _, notificationId))

          findRelease(releaseId).get
        }
      }
    }
  }

  override def deleteRelease(id: Long): Future[Int] = {
    val r = ReleaseTable.column
    DB futureLocalTx { implicit session => {
      Future {
        withSQL{update(ReleaseTable).set(r.deleted -> true)}.update().apply()
        }
      }
    }
  }
  override def generateReleases(amount: Int, month: YearMonth): Future[Seq[Release]] = ???
}