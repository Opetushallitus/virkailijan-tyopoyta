package fi.vm.sade.vst.repository

import fi.vm.sade.vst.DBConfig
import fi.vm.sade.vst.model._
import java.time.{LocalDate, YearMonth}
import scala.util.Random
import scalikejdbc._
import Tables._

class DBReleaseRepository(val config: DBConfig) extends ReleaseRepository with SessionInfo {
  val (r, n, c, nt, t, tg, tgc, tl, tc, cat, rc, ee, ug) = (
    ReleaseTable.syntax,
    NotificationTable.syntax,
    NotificationContentTable.syntax,
    NotificationTagTable.syntax,
    TagTable.syntax,
    TagGroupTable.syntax,
    TagGroupCategoryTable.syntax,
    TimelineTable.syntax,
    TimelineContentTable.syntax,
    CategoryTable.syntax,
    ReleaseCategoryTable.syntax,
    EmailEventTable.syntax,
    ReleaseUserGroupTable.syntax)

  private def findRelease(id: Long): Option[Release] = {
    val q = withSQL[Release] {
      select
        .from(ReleaseTable as r)
        .leftJoin(ReleaseCategoryTable as rc).on(r.id, rc.releaseId)
        .leftJoin(ReleaseUserGroupTable as ug).on(r.id, ug.releaseId)
        .where.eq(r.id, id)
    }
    q.one(ReleaseTable(r))
      .toManies(
        rs => ReleaseCategoryTable.opt(rc)(rs),
        rs => ReleaseUserGroupTable.opt(ug)(rs)
      ).map((release, categories, groups) => release.copy(categories = categories.map(_.categoryId),
      usergroups = groups.map(_.usergroupId)))
      .single.apply()
  }

  private def notificationForRelease(releaseId: Long): Option[Notification] =
    withSQL[Notification]{
      select
        .from(NotificationTable as n)
        .leftJoin(NotificationContentTable as c).on(n.id, c.notificationId)
        .leftJoin(NotificationTagTable as nt).on(n.id, nt.notificationId)
        .where.eq(n.releaseId, releaseId)
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

  private def timelineForRelease(releaseId: Long): Seq[TimelineItem] =
    withSQL[TimelineItem] {
      select
        .from(TimelineTable as tl)
        .leftJoin(TimelineContentTable as tc).on(tl.id, tc.timelineId)
        .where.eq(tl.releaseId, releaseId)
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
      rs => ReleaseCategoryTable.opt(rc)(rs),
      rs => NotificationTable.opt(n)(rs),
      rs => NotificationContentTable.opt(c)(rs),
      rs => NotificationTagTable.opt(nt)(rs)).map {
      (_, categories, notifications, content, tags) =>
        notifications.headOption.map(n => n.copy(
          content = content.groupBy(_.language).transform((_, v) => v.head),
          tags = tags.map(_.tagId),
          categories = categories.map(_.categoryId)))
    }.list.apply().flatten
  }

  private def listUnpublishedNotifications: Seq[Notification] = {
    val sql: SQL[Release, NoExtractor] = withSQL[Release]{
      notificationJoins
        .where.gt(n.publishDate, LocalDate.now())
        .and.eq(r.deleted, false).and.eq(n.deleted, false)
        .orderBy(n.publishDate).desc
    }
    notificationsFromRS(sql)
  }

  private def listNotifications(categories: RowIds, tags: RowIds, page: Int): NotificationList = {
    val sql: SQL[Release, NoExtractor] = withSQL[Release] {
      notificationJoins
        .where.not.gt(n.publishDate, LocalDate.now())
        .and.withRoundBracket{_.gt(n.expiryDate, LocalDate.now()).or.isNull(n.expiryDate)}
        .and.eq(r.deleted, false).and.eq(n.deleted, false)
        .and(sqls.toAndConditionOpt(
          tags.map(t => sqls.in(nt.tagId, t)),
          categories.map(categories => sqls.in(rc.categoryId, categories))
        ))
        .orderBy(n.publishDate).desc
    }
    val notifications = notificationsFromRS(sql)
    NotificationList(notifications.size, notifications.slice(offset(page), offset(page) + pageLength))
  }

  override def notification(id: Long): Option[Notification] = {
    val sql: SQL[Release, NoExtractor] = withSQL[Release] {
      notificationJoins
        .where.not.gt(n.publishDate, LocalDate.now())
        .and.withRoundBracket{_.gt(n.expiryDate, LocalDate.now()).or.isNull(n.expiryDate)}
        .and.eq(r.deleted, false).and.eq(n.deleted, false)
        .and.eq(n.id, id)
        .orderBy(n.publishDate).desc
    }
    notificationsFromRS(sql).headOption
  }

  private def listTimeline(categories: RowIds, month: YearMonth): Seq[TimelineItem] = {

    val startDate = month.atDay(1)
    val endDate = month.atEndOfMonth()

    val sql = withSQL[Release] {
       select
        .from(ReleaseTable as r)
        .leftJoin(ReleaseCategoryTable as rc).on(r.id, rc.releaseId)
        .join(TimelineTable as tl).on(r.id, tl.releaseId)
        .leftJoin(NotificationTable as n)
          .on(sqls.eq(r.id, n.releaseId)
          .and(sqls.le(n.publishDate, LocalDate.now()))
          .and(sqls.gt(n.expiryDate, LocalDate.now())))
        .leftJoin(TimelineContentTable as tc).on(tl.id, tc.timelineId)
        .where.between(tl.date, startDate, endDate)
        .and(sqls.toAndConditionOpt(
          categories.map(cs => sqls.in(rc.categoryId, cs))
        ))
    }

    sql.one(ReleaseTable(r)).toManies(
      rs => TimelineTable.opt(tl)(rs),
      rs => TimelineContentTable.opt(tc)(rs),
      rs => NotificationTable.opt(n)(rs))
      .map {
        (rel, timeline, content, notification) =>  timeline.map(tl =>
        tl.copy(content = content.filter(_.timelineId == tl.id).groupBy(_.language).transform((_, v) => v.head),
                notificationId = notification.headOption.map(_.id))
      )
    }.list.apply().flatten
  }


  def tags: Seq[TagGroup] = {
    val sql = withSQL[TagGroup]{
      select
        .from(TagGroupTable as tg)
        .leftJoin(TagTable as t).on(tg.id, t.groupId)
        .leftJoin(TagGroupCategoryTable as tgc).on(tg.id, tgc.groupId)
    }

    sql.one(TagGroupTable(tg)).toManies(
      rs => TagTable.opt(t)(rs),
      rs => TagGroupCategoryTable.opt(tgc)(rs))
      .map{
        (tagGroup, tags, categories) => tagGroup.copy(tags = tags, categories = categories.map(_.categoryId))
      }.list.apply()
  }

  def categories(user: User): Seq[Category] = {
    if(user.isAdmin){
      withSQL(select.from(CategoryTable as cat)).map(CategoryTable(cat)).list.apply
    } else{
      withSQL(select.from(CategoryTable as cat).where.in(cat.role, user.roles)).map(CategoryTable(cat)).list.apply
    }
  }

  override def notifications(categories: RowIds, tags: RowIds, page: Int): NotificationList = {
    listNotifications(categories, tags, page)
  }

  override def unpublishedNotifications: Seq[Notification] = listUnpublishedNotifications

  override def timeline(categories: RowIds, month: YearMonth): Timeline = {
    val eventsForMonth = listTimeline(categories, month)
    val dayEvents: Map[String, Seq[TimelineItem]] = eventsForMonth.groupBy(tl => tl.date.getDayOfMonth.toString)

    Timeline(month.getMonthValue, month.getYear, dayEvents)
  }

  def release(id: Long): Option[Release] = {
    val release = findRelease(id)
    release.map(r => r.copy(
      notification = notificationForRelease(r.id),
      timeline = timelineForRelease(r.id)))
  }

  def releases: Iterable[Release] = {
    withSQL(select.from(ReleaseTable as r)).map(ReleaseTable(r)).list.apply
  }

  private def insertRelease(releaseUpdate: ReleaseUpdate)(implicit session: DBSession): Long = {

    val q = withSQL(insert.into(ReleaseTable).namedValues(ReleaseTable.column.deleted -> false))

    val releaseId = q.updateAndReturnGeneratedKey().apply()

    insertReleaseCategories(releaseId, releaseUpdate.categories)
    insertReleaseUsergroups(releaseId, releaseUpdate.usergroups)

    releaseId
  }

  private def insertNotification(releaseId: Long, uid: String, notification: NotificationUpdate)(implicit session: DBSession): Long = {
    val n = NotificationTable.column
    withSQL {
      insert.into(NotificationTable).namedValues(
        n.releaseId -> releaseId,
        n.publishDate -> notification.publishDate,
        n.expiryDate -> notification.expiryDate,
        n.createdBy -> uid,
        n.createdAt -> LocalDate.now()
      )
    }.updateAndReturnGeneratedKey().apply()
  }

  private def insertNotificationContent(notificationId: Long, content: NotificationContent)(implicit session: DBSession): Int = {
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

  private def insertNotificationTags(notificationId: Long, tagId: Long)(implicit session: DBSession): Int = {
    val nt = NotificationTagTable.column
    withSQL {
      insert.into(NotificationTagTable).namedValues(
        nt.notificationId -> notificationId,
        nt.tagId -> tagId
      )
    }.update().apply()
  }

  private def addNotification(releaseId: Long, uid: String, notification: NotificationUpdate)(implicit session: DBSession): Long = {
      val notificationId: Long = insertNotification(releaseId, uid, notification)
      notification.content.values.foreach(insertNotificationContent(notificationId, _))
      notification.tags.foreach(t => insertNotificationTags(notificationId, t))
      notificationId
  }

  private def insertTimelineItem(releaseId: Long, item: TimelineItem)(implicit session: DBSession): Long = {
    val t = TimelineTable.column
    withSQL {
      insert.into(TimelineTable).namedValues(
        t.releaseId -> releaseId,
        t.date -> item.date
      )
    }.updateAndReturnGeneratedKey().apply()
  }

  private def insertTimelineContent(itemId: Long, content: TimelineContent)(implicit session: DBSession): Unit ={
    val tc = TimelineContentTable.column
   withSQL{
      insert.into(TimelineContentTable).namedValues(
        tc.timelineId -> itemId,
        tc.language -> content.language,
        tc.text -> content.text
      )
    }.update.apply()
  }

  private def addTimelineItem(releaseId: Long, item: TimelineItem, notificationId: Option[Long])(implicit session: DBSession): Unit = {
      val itemId = insertTimelineItem(releaseId, item)
      item.content.values.foreach(insertTimelineContent(itemId, _))
  }

  private def insertReleaseCategories(releaseId: Long, categories: Seq[Long])(implicit session: DBSession): Unit = {
    val rc = ReleaseCategoryTable.column
    val batchParams: Seq[Seq[Long]] = categories.map(c => Seq(releaseId, c))
    withSQL{
      insert.into(ReleaseCategoryTable).namedValues(rc.releaseId -> sqls.?, rc.categoryId -> sqls.?)
    }.batch(batchParams: _*).apply()
  }

  private def deleteReleaseCategories(releaseId: Long, categories: Seq[Long])(implicit session: DBSession): Unit = {
    withSQL{
      delete.from(ReleaseCategoryTable as rc)
        .where.eq(rc.releaseId, releaseId)
        .and.in(rc.categoryId, categories)
    }.update().apply()
  }

  private def insertReleaseUsergroups(releaseId: Long, userGroups: Seq[Long])(implicit session: DBSession): Unit = {
    val column = ReleaseUserGroupTable.column
    val batchParams = userGroups.map(g => Seq(releaseId, g))
    withSQL{
      insert.into(ReleaseUserGroupTable).namedValues(column.releaseId -> sqls.?, column.usergroupId -> sqls.?)
    }.batch(batchParams: _*).apply()
  }

  private def deleteReleaseUsergroups(releaseId: Long, userGroups: Seq[Long])(implicit session: DBSession): Unit = {
    withSQL{
      delete.from(ReleaseUserGroupTable as ug)
        .where.eq(ug.releaseId, releaseId)
        .and.in(ug.usergroupId, userGroups)
    }.update().apply()
  }

  private def updateReleaseUsergroups(releaseUpdate: ReleaseUpdate)(implicit session: DBSession) = {

    val currentUsergroups = withSQL[ReleaseUserGroup](
      select.from(ReleaseUserGroupTable as ug).where.eq(ug.releaseId, releaseUpdate.id))
      .map(ReleaseUserGroupTable(ug)).toList().apply().map(_.usergroupId)

    val removed = currentUsergroups.diff(releaseUpdate.usergroups)
    val added = releaseUpdate.usergroups.diff(currentUsergroups)

    deleteReleaseUsergroups(releaseUpdate.id, removed)
    insertReleaseUsergroups(releaseUpdate.id, added)
  }

  private def updateReleaseCategories(releaseUpdate: ReleaseUpdate)(implicit session: DBSession) = {

    val existingCategories = withSQL[ReleaseCategory](
      select.from(ReleaseCategoryTable as rc).where.eq(rc.releaseId, releaseUpdate.id))
      .map(ReleaseCategoryTable(rc)).toList().apply().map(_.categoryId)

    val removed = existingCategories.diff(releaseUpdate.categories)
    val added = releaseUpdate.categories.diff(existingCategories)

    deleteReleaseCategories(releaseUpdate.id, removed)
    insertReleaseCategories(releaseUpdate.id, added)
  }

  private def deleteNotification(notificationId: Long): Unit = {
    withSQL(update(NotificationTable as n).set(n.id -> notificationId)).update().apply()
  }

  private def updateNotification(current: Notification, updated: NotificationUpdate, userId: String): Unit = {
    withSQL{
      update(NotificationTable as n).set(n.publishDate -> updated.publishDate,
                                         n.expiryDate -> updated.expiryDate,
                                         n.sendEmail -> updated.sendEmail,
                                         n.modifiedBy -> userId,
                                         n.modifiedAt -> LocalDate.now())
    }.update().apply()

    withSQL(delete.from(NotificationContentTable as c).where.eq(c.notificationId, current.id)).update().apply()
    updated.content.values.foreach(insertNotificationContent(current.id, _))
  }

  private def insertOrUpdateNotification(releaseUpdate: ReleaseUpdate, userId: String)(implicit session: DBSession) = {
    val currentNotification: Option[Notification] = notificationForRelease(releaseUpdate.id)

    (currentNotification, releaseUpdate.notification) match {
      case (None, Some(n)) => addNotification(releaseUpdate.id, userId, n)
      case (Some(n), None) => deleteNotification(n.id)
      case (Some(current), Some(updated)) => updateNotification(current, updated, userId)
      case _ => ()
    }
  }

  private def deleteTimelineItems(deletedItems: Seq[TimelineItem]) = {
    withSQL(delete.from(TimelineContentTable as tc).where.in(tc.timelineId, deletedItems.map(_.id))).update().apply()
    withSQL(delete.from(TimelineTable as tl).where.in(tl.id, deletedItems.map(_.id))).update().apply()
  }

  private def updateTimelineItem(item: TimelineItem)(implicit session: DBSession) = {
    val column = TimelineTable.column
    withSQL(update(TimelineTable as tl).set(column.date -> item.date)).update().apply()
    withSQL(delete.from(TimelineContentTable as tc).where.eq(tc.timelineId, item.id)).update().apply()
    item.content.values.foreach(insertTimelineContent(item.id, _))
  }

  private def updateReleaseTimeline(releaseUpdate: ReleaseUpdate, userId: String) = {
    val currentTimeline: Seq[TimelineItem] = timelineForRelease(releaseUpdate.id)

    //check for new items to be inserted

    val newItems = releaseUpdate.timeline.filter(_.id < 0)

    newItems.foreach(insertTimelineItem(releaseUpdate.id, _))

    val deletedItems = currentTimeline.filter(item => !releaseUpdate.timeline.map(_.id).contains(item.id))

    deleteTimelineItems(deletedItems)

    val updatedItems = releaseUpdate.timeline.filter(_.id >= 0)

    updatedItems.foreach(updateTimelineItem)
  }


  override def updateRelease(userId: String, releaseUpdate: ReleaseUpdate): Option[Release] = {
    DB localTx { implicit session =>

      updateReleaseCategories(releaseUpdate)
      updateReleaseUsergroups(releaseUpdate)
      insertOrUpdateNotification(releaseUpdate, userId)
      updateReleaseTimeline(releaseUpdate, userId)

      findRelease(releaseUpdate.id)
    }
  }

  override def addRelease(uid: String, releaseUpdate: ReleaseUpdate): Option[Release] = {
    DB localTx { implicit session =>
      val releaseId = insertRelease(releaseUpdate)
      val notificationId = releaseUpdate.notification.map(addNotification(releaseId, uid, _))
      releaseUpdate.timeline.foreach(addTimelineItem(releaseId, _, notificationId))
      findRelease(releaseId)
    }
  }

  override def deleteRelease(id: Long): Int = {
    val r = ReleaseTable.column
    DB localTx { implicit session =>
      withSQL{update(ReleaseTable).set(r.deleted -> true)}.update().apply()
    }
  }

  override def generateReleases(amount: Int, month: YearMonth): Seq[Release] = {
    val releases = for(_ <- 1 to amount) yield generateRelease("testi", month)
    releases.flatten
  }

  // Some helper functions for release generation
  private def addNewRelease(release: Release): Long = {
    val releaseCol = ReleaseTable.column
    val id: Long = withSQL {
      insert.into(ReleaseTable).namedValues(
        releaseCol.deleted -> release.deleted
      )
    }.updateAndReturnGeneratedKey.apply()
    id
  }
  private def mockText: String = {
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
      "Phasellus convallis sapien neque, vitae porta risus luctus sed. " +
      "Morbi placerat elementum massa nec porta. Sed massa sapien, semper at ullamcorper eu, vestibulum non diam. " +
      "Aenean eleifend ut nisl et commodo. Nunc accumsan ante ac diam tristique, eget luctus nulla consequat. " +
      "Mauris a volutpat nibh. Nunc vel dapibus ex, quis aliquet nunc. In congue diam quis ultricies malesuada. " +
      "Aenean cursus purus ut erat tempor, non finibus sapien pharetra. Phasellus malesuada, sem vitae bibendum egestas, " +
      "nunc velit cursus diam, id auctor erat ante at ante. Nulla libero lectus, bibendum id placerat vel, " +
      "fringilla quis nisi. Donec dapibus scelerisque risus, lobortis tempor erat. Aenean scelerisque nec metus at " +
      "consequat. Suspendisse vel fermentum erat. Duis id elit convallis, suscipit dolor in, tincidunt " +
      "turpis.\n\nCurabitur libero ligula, tincidunt at consectetur vel, mollis ut ante. Maecenas condimentum " +
      "condimentum lobortis. In nibh velit, vestibulum at odio sed massa nunc."
  }
  private def emptyRelease: Release = Release(id = 0, notification = None, timeline = Seq.empty)
  private def generateRelease(uid: String, month: YearMonth): Option[Release] = {
    val releaseId = addNewRelease(emptyRelease)
    val startDay = Random.nextInt(month.atEndOfMonth().getDayOfMonth - 1)+1
    val startDate = month.atDay(startDay)
    val endDate = month.atDay(Random.nextInt(month.atEndOfMonth().getDayOfMonth - startDay)+startDay)
    val notificationContent = NotificationContent(releaseId, "fi", s"$month-$startDay Lorem Ipsum", mockText.dropRight(Random.nextInt(mockText.length)).mkString)
    val notification = NotificationUpdate(releaseId, releaseId, startDate, Option(endDate),  Map("fi" -> notificationContent), List.empty)
    addNotification(releaseId, uid, notification)
    generateTimeLine(releaseId, startDate, endDate)
    release(releaseId)
  }

  private def generateTimeLine(releaseId: Long, startDate: LocalDate, endDate: LocalDate): Unit = {
    val day = Random.nextInt(endDate.getDayOfMonth - startDate.getDayOfMonth + 1)+startDate.getDayOfMonth
    val publishDate = LocalDate.of(startDate.getYear, startDate.getMonth, day)
    val timelineItem = TimelineItem(releaseId, releaseId, publishDate, Map.empty)
    val timelineId = insertTimelineItem(releaseId, timelineItem)
    val timelineContent = TimelineContent(timelineId, "fi", mockText.dropRight(Random.nextInt(mockText.length)).mkString)
    insertTimelineContent(timelineId, timelineContent)
  }

  def emailReleasesForDate(date: LocalDate): Seq[Release] = {
    val result = withSQL[Release] {
      select.from(ReleaseTable as r)
        .join(NotificationTable as n).on(r.id, n.releaseId)
        .leftJoin(EmailEventTable as ee).on(r.id, ee.releaseId)
        .where.eq(n.publishDate, date).and.isNull(ee.id)
    }
    result.map(ReleaseTable(r))
      .list
      .apply()
      .flatMap(r => release(r.id))
  }

  def emailLogs: Seq[EmailEvent] = withSQL{select.from(EmailEventTable as ee)}.map(EmailEventTable(ee)).list.apply
}