package fi.vm.sade.vst.repository

import fi.vm.sade.vst.DBConfig
import fi.vm.sade.vst.model._
import java.time.{LocalDate, YearMonth}
import scala.collection.immutable.Seq
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scalikejdbc._
import Tables._

class DBReleaseRepository(val config: DBConfig) extends ReleaseRepository with SessionInfo {
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


  private def notificationJoins: scalikejdbc.SelectSQLBuilder[Release] = select
    .from(ReleaseTable as r)
    .leftJoin(ReleaseCategoryTable as rc).on(r.id, rc.releaseId)
    .innerJoin(NotificationTable as n).on(r.id, n.releaseId)
    .leftJoin(NotificationContentTable as c).on(n.id, c.notificationId)
    .leftJoin(NotificationTagTable as nt).on(n.id, nt.notificationId)

  private def notificationsFromRS(sql: SQL[Release, NoExtractor]): Seq[Notification] = {
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

  private def listUnpublishedNotifications(): Seq[Notification] = {
    val sql: SQL[Release, NoExtractor] = withSQL[Release]{
      notificationJoins
        .where.gt(n.publishDate, LocalDate.now())
        .and.eq(r.deleted, false).and.eq(n.deleted, false)
    }
    notificationsFromRS(sql)

  }

  private def listNotifications(categories: RowIds, tags: RowIds, page: Int): Seq[Notification] = {
    val sql: SQL[Release, NoExtractor] = withSQL[Release] {
      notificationJoins
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
    notificationsFromRS(sql)
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


  def tags: Future[Seq[Tag]] = Future{withSQL{select.from(TagTable as t)}.map(TagTable(t)).list.apply}

  def categories: Future[Seq[Category]] = Future {
    withSQL{select.from(CategoryTable as cat)}.map(CategoryTable(cat)).list.apply
  }

  override def notifications(categories: RowIds, tags: RowIds, page: Int): Future[Seq[Notification]] = {
    Future{
      listNotifications(categories, tags, page)
    }
  }

  override def unpublishedNotifications(): Future[Seq[Notification]] = {
    Future{
      listUnpublishedNotifications()
    }
  }

  override def timeline(categories: RowIds, month: YearMonth): Future[Timeline] = {
    Future{
      val eventsForMonth = listTimeline(categories, month)
      val dayEvents: Map[String, Seq[TimelineItem]] = eventsForMonth.groupBy(tl => tl.date.getDayOfMonth.toString)

      Timeline(month.getMonthValue, month.getYear, dayEvents)
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

  def releases: Future[Iterable[Release]] = {
    Future {
      withSQL(select.from(ReleaseTable as r)).map(ReleaseTable(r)).list.apply
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