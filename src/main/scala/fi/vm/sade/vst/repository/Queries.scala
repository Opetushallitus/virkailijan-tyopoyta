//package fi.vm.sade.vst.repository
//
//import fi.vm.sade.vst.model._
//import scalikejdbc._
//
//object NotificationS extends SQLSyntaxSupport[Notification]{
//  override val tableName = "notification"
//  def apply(n: SyntaxProvider[Notification])(rs: WrappedResultSet): Notification = apply(n.resultName)(rs)
//  def apply(n: ResultName[Notification])(rs: WrappedResultSet): Notification =
//    Notification(id = rs.get(n.id),
//      releaseId = rs.get(n.releaseId),
//      publishDate = rs.date(n.publishDate),
//      expiryDate = None)
//  def opt(n: SyntaxProvider[Notification])(rs: WrappedResultSet): Option[Notification] =
//    rs.longOpt(n.resultName.releaseId).map(_ => NotificationS(n)(rs))
//}
//
//object NotificationContentS extends SQLSyntaxSupport[NotificationContent]{
//  override val tableName = "notification_content"
//  def apply(n: SyntaxProvider[NotificationContent])(rs: WrappedResultSet): NotificationContent = apply(n.resultName)(rs)
//  def apply(n: ResultName[NotificationContent])(rs: WrappedResultSet): NotificationContent =
//    NotificationContent(rs.get(n.notificationId), rs.get(n.language), rs.get(n.title), rs.get(n.text))
//
//  def opt(c: SyntaxProvider[NotificationContent])(rs: WrappedResultSet): Option[NotificationContent] =
//    rs.longOpt(c.resultName.notificationId).map(_ => NotificationContentS(c)(rs))
//}
//
//object TagS extends SQLSyntaxSupport[Tag]{
//  override val tableName = "tag"
//  def apply(t: SyntaxProvider[Tag])(rs: WrappedResultSet): Tag = apply(t.resultName)(rs)
//  def apply(t: ResultName[Tag])(rs: WrappedResultSet): Tag = Tag(rs.get(t.id), rs.get(t.name))
//
//  def opt(t: SyntaxProvider[Tag])(rs: WrappedResultSet): Option[Tag] =
//    rs.longOpt(t.resultName.id).map(_ => TagS(t)(rs))
//}
//
//object NotificationTagsS extends SQLSyntaxSupport[NotificationTags]{
//  override val tableName = "notification_tag"
//  def apply(n: SyntaxProvider[NotificationTags])(rs: WrappedResultSet): NotificationTags = apply(n.resultName)(rs)
//  def apply(n: ResultName[NotificationTags])(rs: WrappedResultSet): NotificationTags =
//    NotificationTags(rs.get(n.notificationId), rs.get(n.tagId))
//
//  def opt(c: SyntaxProvider[NotificationTags])(rs: WrappedResultSet): Option[NotificationTags] =
//    rs.longOpt(c.resultName.tagId).map(_ => NotificationTagsS(c)(rs))
//}
//
//object ReleaseS extends SQLSyntaxSupport[Release]{
//  override val tableName = "release"
//  def apply(n: SyntaxProvider[Release])(rs: WrappedResultSet): Release = apply(n.resultName)(rs)
//  def apply(n: ResultName[Release])(rs: WrappedResultSet): Release = Release(rs.get(n.id), rs.get(n.sendEmail))
//}
//
//object TimelineItemS extends SQLSyntaxSupport[TimelineItem]{
//  override val tableName = "timeline_item"
//  def apply(tl: SyntaxProvider[TimelineItem])(rs: WrappedResultSet): TimelineItem = apply(tl.resultName)(rs)
//  def apply(tl: ResultName[TimelineItem])(rs:WrappedResultSet): TimelineItem = TimelineItem(rs.get(tl.id), rs.get(tl.releaseId), rs.get(tl.date))
//}
//
//object TimelineContentS extends SQLSyntaxSupport[TimelineContent]{
//  override val tableName = "timeline_content"
//  def apply(c: SyntaxProvider[TimelineContent])(rs: WrappedResultSet): TimelineContent = apply(c.resultName)(rs)
//  def apply(c: ResultName[TimelineContent])(rs: WrappedResultSet): TimelineContent =
//    TimelineContent(rs.get(c.timelineId), rs.get(c.language), rs.get(c.text))
//  def opt(c: SyntaxProvider[TimelineContent])(rs: WrappedResultSet): Option[TimelineContent] =
//    rs.longOpt(c.resultName.timelineId).map(_ => TimelineContentS(c)(rs))
//}
//
//object Queries{
//
//  Class.forName("org.postgresql.Driver")
//  ConnectionPool.singleton("jdbc:postgresql:virkailijan_tyopoyta", "vst_admin", "kissa13")
//
//  implicit val session = AutoSession
//
//  val (r, n, c, nt, t, tl, tc) =
//    (ReleaseS.syntax, NotificationS.syntax, NotificationContentS.syntax, NotificationTagsS.syntax, TagS.syntax, TimelineItemS.syntax, TimelineContentS.syntax)
//
//  def releases(): Seq[Release] =
//    withSQL[Release]{
//      select.from(ReleaseS as r)}.map(ReleaseS(r))
//    .list.apply()
//
//  def releaseNotifications(releases: Seq[Release]): Seq[Notification] =
//    withSQL[Notification]{
//      select
//        .from(NotificationS as n)
//        .leftJoin(NotificationContentS as c).on(n.id, c.notificationId)
//        .leftJoin(NotificationTagsS as nt).on(n.id, nt.notificationId)
//        .leftJoin(TagS as t).on(nt.tagId, t.id)
//        .where.in(n.releaseId, releases.map(_.id))
//    }
//      .one(NotificationS(n))
//      .toManies(
//        rs => NotificationContentS.opt(c)(rs),
//        rs => NotificationTagsS.opt(nt)(rs),
//        rs => TagS.opt(t)(rs))
//      .map{ (notification, content, notification_tags, tag) => notification.copy(
//        content = content.groupBy(_.language).transform((k,v) => v.head))}
//      .list
//      .apply()
//
//  def releaseTimelineItems(releases: Seq[Release]): Seq[TimelineItem] =
//    withSQL[TimelineItem] {
//      select
//        .from(TimelineItemS as tl)
//        .leftJoin(TimelineContentS as tc).on(tl.id, tc.timelineId)
//        .where.in(tl.releaseId, releases.map(_.id))
//    }
//      .one(TimelineItemS(tl))
//        .toMany(
//          rs => TimelineContentS.opt(tc)(rs))
//    .map{ (timelineItem, timelineContent) => timelineItem.copy(
//      content = timelineContent.groupBy(_.language).transform((k,v) => v.head)
//    )}.list.apply()
//
//
////
//  def tags(): Seq[Tag] = withSQL{select.from(TagS as t)}.map(TagS(t)).list.apply()
//
//  def getReleases(): Seq[Release] ={
//    val rs = releases()
//    println("Releases: "+rs)
//
//    val nForR = releaseNotifications(rs).groupBy(_.releaseId).transform((k,v) => v.head)
//    val tForR = releaseTimelineItems(rs).groupBy(_.releaseId).transform((k,v) => v)
//
//    val comb = rs.map(r => r.copy(notification = nForR.get(r.id), timelineItems = tForR.getOrElse(r.id, Nil)))
//    println("Combined: "+ comb)
//
//    comb
//  }
//
//  private def insertRelease(release: Release): Long = {
//    val r = ReleaseS.column
//    withSQL {
//      insert.into(ReleaseS).namedValues(
//        r.sendEmail -> release.sendEmail
//      )
//    }.updateAndReturnGeneratedKey().apply()
//  }
//
//  private def insertNotification(releaseId: Long, notification: Notification): Long ={
//    val n = NotificationS.column
//    withSQL {
//      insert.into(NotificationS).namedValues(
//        n.releaseId -> releaseId,
//        n.publishDate -> notification.publishDate,
//        n.expiryDate -> notification.publishDate
//      )
//    }.updateAndReturnGeneratedKey().apply()
//  }
//
//  private def insertNotificationContent(notificationId: Long, content: NotificationContent) = {
//    val nc = NotificationContentS.column
//    withSQL {
//      insert.into(NotificationContentS).namedValues(
//        nc.notificationId -> notificationId,
//        nc.language -> content.language,
//        nc.text -> content.text,
//        nc.title -> content.title
//      )
//    }.update().apply()
//  }
//
//  private def addNotification(releaseId: Long, notification: Notification): Unit ={
//    val notificationId: Long = insertNotification(releaseId, notification)
//    notification.content.values.map(insertNotificationContent(notificationId, _))
//  }
//
//  private def insertTimelineItem(releaseId: Long, item: TimelineItem): Long = {
//    val t = TimelineItemS.column
//    withSQL {
//      insert.into(TimelineItemS).namedValues(
//        t.releaseId -> item.releaseId,
//        t.date -> item.date
//      )
//    }.updateAndReturnGeneratedKey().apply()
//  }
//
//  private def insertTimelineContent(itemId: Long, content: TimelineContent): Unit ={
//    val tc = TimelineContentS.column
//    withSQL{
//      insert.into(TimelineContentS).namedValues(
//        tc.timelineId -> itemId,
//        tc.language -> content.language,
//        tc.text -> content.text
//      )
//    }.update.apply()
//  }
//
//  private def addTimelineItem(releaseId: Long, item: TimelineItem) = {
//    val itemId = insertTimelineItem(releaseId, item)
//    item.content.values.foreach(insertTimelineContent(itemId, _))
//  }
//
//  def addRelease(release: Release): Unit = {
//    val releaseId = insertRelease(release)
//    release.notification.foreach(addNotification(releaseId, _))
//    release.timelineItems.foreach(addTimelineItem(releaseId, _))
//  }
//}