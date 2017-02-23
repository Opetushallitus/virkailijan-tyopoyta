package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model.{JsonSupport, ReleaseUpdate, _}
import java.time.{LocalDate, YearMonth}
import java.util.concurrent.atomic.AtomicReference
import scala.util.Random


class ReleaseRepositoryMock() extends ReleaseRepository with JsonSupport {

  private val mockText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus convallis sapien neque, vitae porta risus luctus sed. Morbi placerat elementum massa nec porta. Sed massa sapien, semper at ullamcorper eu, vestibulum non diam. Aenean eleifend ut nisl et commodo. Nunc accumsan ante ac diam tristique, eget luctus nulla consequat. Mauris a volutpat nibh. Nunc vel dapibus ex, quis aliquet nunc. In congue diam quis ultricies malesuada. Aenean cursus purus ut erat tempor, non finibus sapien pharetra. Phasellus malesuada, sem vitae bibendum egestas, nunc velit cursus diam, id auctor erat ante at ante. Nulla libero lectus, bibendum id placerat vel, fringilla quis nisi. Donec dapibus scelerisque risus, lobortis tempor erat. Aenean scelerisque nec metus at consequat. Suspendisse vel fermentum erat. Duis id elit convallis, suscipit dolor in, tincidunt turpis.\n\nCurabitur libero ligula, tincidunt at consectetur vel, mollis ut ante. Maecenas condimentum condimentum lobortis. In nibh velit, vestibulum at odio sed massa nunc."

  private val releasesMap = new AtomicReference(Map[Long, Release]())

  private val notificationTags = parseTags(scala.io.Source.fromInputStream(getClass.getResourceAsStream("/data/tags.json")).mkString).get

  def getTags(names: String*): List[Int] = {
    notificationTags.filter(t => names.contains(t.name)).map(_.id.toInt)
  }

  def tags: List[Tag] = notificationTags

  private val releasesList = parseReleases(scala.io.Source.fromInputStream(getClass.getResourceAsStream("/data/releases.json")).mkString)

  private var initReleases = Map[Long, Release]()

  releasesList match {
    case Some(p) =>
      p.foreach((release: Release) => {
        initReleases += (release.id -> release)
      })
    case None => println("Error parsing release JSON")
  }

  releasesMap.set(initReleases)

  def nextReleaseId: Long = releasesMap.get().values.map(_.id).max +1

  def notifications: Iterable[Option[Notification]] = releasesMap.get().values.map(_.notification)
  private def nextNotificationId: Long = notifications.flatMap(_.map(_.id)).max + 1
  def nextTimelineId: Long = releasesMap.get().values.flatMap(_.timeline).map(_.id).max + 1

  def getReleases: Seq[Release] = releasesMap.get().values.toList

  def persistNotification(releaseId: Long, notification: Notification): Notification = {
    notification.copy(id = nextNotificationId, releaseId = releaseId)
  }

  def persistTimeline(releaseId: Long, timelineItem: TimelineItem): TimelineItem = {
    timelineItem.copy(id = nextTimelineId, releaseId = releaseId)
  }

  override def addRelease(releaseUpdate: ReleaseUpdate): Option[Release] = {
    val id = nextReleaseId
    val persistedRelease =
      Release(id = id,
        notification = releaseUpdate.notification.map(persistNotification(id, _)),
        timeline = releaseUpdate.timeline.map(persistTimeline(id, _)),
        categories = releaseUpdate.categories,
        createdBy = 0, createdAt = LocalDate.now())

    releasesMap.set(releasesMap.get() + (id -> persistedRelease))
    Option(persistedRelease)
  }

  override def timeline(categories: RowIds, month: YearMonth): Timeline = {
    var timelineItems: List[TimelineItem] = List()
    var days: Map[String, List[TimelineItem]] = Map()
    releasesMap.get().filter(_._2.timeline.nonEmpty)foreach(p =>{
      p._2.timeline.foreach( (t: TimelineItem) => {
        timelineItems = t :: timelineItems
      })
    })
    val startDate = month.atDay(1)
    val endDate = month.atEndOfMonth()

    timelineItems = timelineItems.filter(_.date.toEpochDay >= startDate.toEpochDay).filter(_.date.toEpochDay < endDate.toEpochDay).sortBy(_.date.toEpochDay)

    timelineItems.foreach( (t: TimelineItem) => {
      val day = t.date.getDayOfMonth
      days.get(day.toString) match {
        case Some(v) => days += (day.toString -> (t :: v))
        case None => days += (day.toString -> List(t))
      }
    })
    Timeline(startDate.getMonthValue,startDate.getYear,days)
  }

  override def notifications(categories: RowIds, tags: RowIds, page: Int): Seq[Notification] =
    releasesMap.get.values.flatMap(_.notification).toList

  override def unpublished: Seq[Release] =
    releasesMap.get.filter(_._2.notification.get.publishDate.toEpochDay > LocalDate.now.toEpochDay).values.toList

  override def unpublishedNotifications: Seq[Notification] =
    releasesMap.get.values.flatMap(_.notification).filter(LocalDate.now.toEpochDay < _.publishDate.toEpochDay).toList.sortBy(-_.publishDate.toEpochDay)

  override def categories: Seq[Category] = Seq.empty

  override def release(id: Long): Option[Release] = releasesMap.get.get(id)

  override def releases: Iterable[Release] = releasesMap.get.values

  override def generateReleases(amount: Int, month: YearMonth): Seq[Release] = {
    for( a <- 1 to amount){
      val id = nextReleaseId
      val release = generateRelease(id, month)
      releasesMap.set(releasesMap.get() + (id -> release))
    }
    releasesMap.get().values.toList
  }

  def generateRelease(id: Long, month: YearMonth): Release ={
    val notificationId = 1
    val startDay = Random.nextInt(month.atEndOfMonth().getDayOfMonth - 1)+1
    val startDate = month.atDay(startDay)
    val endDate = month.atDay(Random.nextInt(month.atEndOfMonth().getDayOfMonth - startDay)+startDay)
    val notificationContent = NotificationContent(id,"fi",month+"-"+startDay+" Lorem Ipsum", mockText.dropRight(Random.nextInt(mockText.length)).mkString)

    val notification = Notification(id,id,startDate,Option(endDate),Option(startDate),Map("fi" -> notificationContent))
    Release(id = id,
      notification = Some(notification),
      timeline = Seq(generateTimeLine(id,startDate,endDate)),
      createdBy = 0,
      createdAt = LocalDate.now()
    )
  }

  def generateTimeLine(releaseId: Long, startDate: LocalDate, endDate: LocalDate): TimelineItem = {
    val day = Random.nextInt(endDate.getDayOfMonth - startDate.getDayOfMonth + 1)+startDate.getDayOfMonth
    val publisDate = LocalDate.of(startDate.getYear, startDate.getMonth, day)
    val timelineContent = TimelineContent(releaseId,"fi", mockText.dropRight(Random.nextInt(mockText.length)).mkString)
    TimelineItem(releaseId,releaseId,publisDate,Map("fi" -> timelineContent))
  }

  override def deleteRelease(id: Long): Int = {
    releasesMap.set(releasesMap.get() - id)
    1
  }
}
