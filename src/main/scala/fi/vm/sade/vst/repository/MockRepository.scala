package fi.vm.sade.vst.repository

import java.io.File
import java.time.{LocalDate, MonthDay, YearMonth}

import fi.vm.sade.vst.model._
import fi.vm.sade.vst.model.JsonSupport
import java.util.concurrent.atomic.AtomicReference

import scala.collection.immutable.{ListMap, Seq}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Random


class MockRepository() extends ReleaseRepository with JsonSupport {

  private val mockText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus convallis sapien neque, vitae porta risus luctus sed. Morbi placerat elementum massa nec porta. Sed massa sapien, semper at ullamcorper eu, vestibulum non diam. Aenean eleifend ut nisl et commodo. Nunc accumsan ante ac diam tristique, eget luctus nulla consequat. Mauris a volutpat nibh. Nunc vel dapibus ex, quis aliquet nunc. In congue diam quis ultricies malesuada. Aenean cursus purus ut erat tempor, non finibus sapien pharetra. Phasellus malesuada, sem vitae bibendum egestas, nunc velit cursus diam, id auctor erat ante at ante. Nulla libero lectus, bibendum id placerat vel, fringilla quis nisi. Donec dapibus scelerisque risus, lobortis tempor erat. Aenean scelerisque nec metus at consequat. Suspendisse vel fermentum erat. Duis id elit convallis, suscipit dolor in, tincidunt turpis.\n\nCurabitur libero ligula, tincidunt at consectetur vel, mollis ut ante. Maecenas condimentum condimentum lobortis. In nibh velit, vestibulum at odio sed massa nunc."

  private val releases = new AtomicReference(Map[Long, Release]())

  private val notificationTags = parseTags(scala.io.Source.fromInputStream(getClass.getResourceAsStream("/data/tags.json")).mkString).get

  def getTags(names: String*): List[Int] = {
    notificationTags.filter(t => names.contains(t.name)).map(_.id.toInt)
  }

  def tags(): Future[List[Tag]] = Future{notificationTags}

  private val releasesList = parseReleases(scala.io.Source.fromInputStream(getClass.getResourceAsStream("/data/releases.json")).mkString)

  private var initReleases = Map[Long, Release]()

  releasesList match {
    case Some(p) =>
        p.foreach((release: Release) => {
          initReleases += (release.id -> release)
        }
      )
    case None => println("Error parsing release JSON")
  }

  releases.set(sortReleasesByPublishDate(initReleases))

  def nextReleaseId(): Long = releases.get().values.map(_.id).max +1

  def notifications(): Iterable[Option[Notification]] = releases.get().values.map(_.notification)
  private def nextNotificationId = notifications().flatMap(_.map(_.id)).max + 1

  def getReleases : Future[Seq[Release]] = Future(
    releases.get().values.toList
  )

  def persistNotification(releaseId: Long, notification: Notification): Notification = {
    notification.copy(id = nextNotificationId, releaseId = releaseId)
  }

  def addRelease(release: Release): Future[Release] = {
    println("Received release: "+ release)
    val id = nextReleaseId()
    val persistedRelease = release.copy(
      id = id,
      notification = release.notification.map(persistNotification(id, _))
    )
    releases.set(sortReleasesByPublishDate(releases.get() + (id -> persistedRelease)))
    Future{persistedRelease}
  }

  def sortReleasesByPublishDate(releases: Map[Long, Release]): Map[Long, Release] = {
    ListMap(releases.toSeq.sortBy(- _._2.notification.get.publishDate.toEpochDay):_*)
  }


  override def timeline(categories: RowIds, month: YearMonth): Future[Timeline] = {
    var timelineItems: List[TimelineItem] = List()
    var days: Map[String, List[TimelineItem]] = Map()
    releases.get().filter(_._2.timeline.nonEmpty)foreach(p =>{
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
    Future{Timeline(startDate.getMonthValue,startDate.getYear,days)}
  }

  override def notifications(categories: RowIds, tags: RowIds, page: Int): Future[Seq[Notification]] =
    Future(releases.get.values.flatMap(_.notification).toList)

  override def categories(): Future[Seq[Category]] = Future(Seq.empty)

  override def release(id: Long): Future[Option[Release]] = Future(releases.get.get(id))

  override def generateReleases(amount: Int, month: YearMonth): Future[Seq[Release]] = {

    println(amount, month)
    for( a <- 1 to amount){
      val id = nextReleaseId
      val release = generateRelease(id, month)
      releases.set(sortReleasesByPublishDate(releases.get() + (id -> release)))
    }
    Future(releases.get().values.toList)
  }
  def generateRelease(id: Long, month: YearMonth): Release ={
    val notificationId = 1
    val startDay = Random.nextInt((month.atEndOfMonth().getDayOfMonth-1))+1
    val startDate = month.atDay(startDay)
    val endDate = month.atDay(Random.nextInt((month.atEndOfMonth().getDayOfMonth-startDay))+startDay)
    println(startDate, endDate)
    val notificationContent = NotificationContent(id,"fi",month+"-"+startDay+" Lorem Ipsum", mockText.dropRight(Random.nextInt(mockText.length)).mkString)

    val notification = Notification(id,id,startDate,Option(endDate),Option(startDate),Map(("fi"->notificationContent)))
    Release(id,false,Option(notification),Seq(generateTimeLine(id,startDate,endDate)))
  }

  def generateTimeLine(releaseId: Long, startDate: LocalDate, endDate: LocalDate): TimelineItem = {

    val day = Random.nextInt((endDate.getDayOfMonth-startDate.getDayOfMonth+1))+startDate.getDayOfMonth
    println(startDate, endDate,(endDate.getDayOfMonth-startDate.getDayOfMonth),day)
    val publisDate = LocalDate.of(startDate.getYear, startDate.getMonth, day)
    val timelineContent = TimelineContent(releaseId,"fi", mockText.dropRight(Random.nextInt(mockText.length)).mkString)
    TimelineItem(releaseId,releaseId,publisDate,Map(("fi"->timelineContent)))
  }
}