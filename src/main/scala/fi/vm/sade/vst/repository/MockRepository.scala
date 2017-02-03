package fi.vm.sade.vst.repository

import java.io.File
import java.time.LocalDate

import fi.vm.sade.vst.model._
import fi.vm.sade.vst.model.JsonSupport
import java.util.concurrent.atomic.AtomicReference

import scala.collection.immutable.ListMap
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

trait ReleaseRepository{
  def getTimeline(amount: Int, startdate: String): Future[Seq[TimelineItem]]
  def getReleases : Future[Seq[Release]]
  def addRelease(release: Release): Future[Release]
  def getTags : Future[Seq[Tag]]

}

class MockRepository() extends ReleaseRepository with JsonSupport {

  private val releases = new AtomicReference(Map[Long, Release]())

  val tagfile = new File(getClass.getResource("/data/tags.json").toURI)
  val tags = parseTags(scala.io.Source.fromFile(tagfile).mkString).get

  def getTags(names: String*): List[Int] = {
    tags.filter(t => names.contains(t.name)).map(_.id.toInt)
  }

  val file = new File(getClass.getResource("/data/releases.json").toURI)

  val releasesList = parseReleases(scala.io.Source.fromFile(file).mkString)

  var initReleases = Map[Long, Release]()

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

  def getReleases : Future[Seq[Release]] = Future{
    releases.get().values.toSeq
  }

  def getTags : Future[Seq[Tag]] = Future{tags}


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
    releases.set(sortReleasesByPublishDate((releases.get() + (id -> persistedRelease))))
    Future{persistedRelease}
  }

  def sortReleasesByPublishDate(releases: Map[Long, Release]): Map[Long, Release] = {
    ListMap(releases.toSeq.sortBy(- _._2.notification.get.publishDate.toEpochDay):_*)
  }


  override def getTimeline(amount: Int,startdate : String): Future[Seq[TimelineItem]] = {
    var timelineItems: List[TimelineItem] = List()
    releases.get().filter(_._2.timeline.nonEmpty)foreach(p =>{
      p._2.timeline.foreach( (t: TimelineItem) => {
        timelineItems = t :: timelineItems
      })
    })
    val date = LocalDate.parse(startdate)
    if(amount < 0){
      println(timelineItems.filter(_.date.toEpochDay <= date.toEpochDay))
      timelineItems = timelineItems.filter(_.date.toEpochDay <= date.toEpochDay).sortBy(- _.date.toEpochDay).slice(0,amount*(-1))
    }else{
      timelineItems = timelineItems.filter(_.date.toEpochDay >= date.toEpochDay).sortBy(- _.date.toEpochDay).slice(0,amount)
    }
    Future{timelineItems}
  }

}
