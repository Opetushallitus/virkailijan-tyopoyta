package fi.vm.sade.vst.repository

import java.io.File
import java.time.{LocalDate, YearMonth}

import fi.vm.sade.vst.model._
import fi.vm.sade.vst.model.JsonSupport
import java.util.concurrent.atomic.AtomicReference

import scala.collection.immutable.{ListMap, Seq => Seq}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class MockRepository() extends ReleaseRepository with JsonSupport {

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

  override def release(id: Long): Future[Option[Release]] = Future(None)
}