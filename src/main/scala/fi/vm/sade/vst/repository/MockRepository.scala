package fi.vm.sade.vst.repository

import java.time.LocalDate

import fi.vm.sade.vst.model._
import java.util.concurrent.atomic.AtomicReference

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object MockRepository {

  private val releases = new AtomicReference(Map[Long, Release]())

  val initialReleases = Map(
    1L -> Release(1, false,
      Some(Notification(1, 1, LocalDate.of(2016, 12, 30), None,
        Map("fi" ->
          NotificationContent(1, "fi", "Häiriötiedote",
            "<p><strong>AIKU</strong>-palvelussa käyttökatko 16.6.2016 kello 01:00-03:00</p>")),
        Nil)),
      List(TimelineItem(1, 1, LocalDate.of(2016, 5, 23),
        Map("fi" -> TimelineContent(1, "fi", "AIKU-palvelussa  käyttökatko"))))),
    2L -> Release(2, false,
    Some(Notification(2, 2, LocalDate.of(2016, 12, 30), None,
      Map("fi" ->
        NotificationContent(2, "fi", "Erityisopetuksena järjestettävän ammatillisen koulutuksen haun valinnat",
          "<p><strong>AIKU</strong>-palvelussa käyttökatko 16.6.2016 kello 01:00-03:00</p>")),
      List(Tag(1, "perusopetus"), Tag(2, "toinen aste"), Tag(3, "valinnat")))),
      Nil),
    3L -> Release(3, false,
      Some(Notification(3, 3,
        LocalDate.of(2016, 12, 30), None,
        Map("fi" ->
          NotificationContent(3, "fi", "Koetulokset ja harkintaan perustuvan valinnan päätökset sekä aloituspaikat tallennettavatt",
            "<p>OPH:n tarkennetun aikataulun mukaisesti kevään yhteishaun koetulokset ja muut pisteet sekä harkintaan</p>")),
        List(Tag(4, "ePerusteet"), Tag(2, "toinen aste"), Tag(3, "valinnat")))),
      List(TimelineItem(2, 3, LocalDate.of(2016, 5, 26),
        Map("fi" -> TimelineContent(2, "fi", "Koetulokset"))))),
    4L -> Release(4, false,
      Some(Notification(4, 4, LocalDate.of(2016, 5, 23), None,
        Map("fi" ->
          NotificationContent(4, "fi", "Pääsy- ja soveltuvuuskoeaihiot 2016",
            "<p>Pääsy-ja-soveltuvuuskokeiden-aihiot-kevät-2016</p>")),
        List(Tag(2, "toinen aste"), Tag(3, "valinnat")))),
      Nil),
    5L -> Release(5, false,
      Some(Notification(5, 5, LocalDate.of(2016, 12, 30), None,
        Map("fi" ->
          NotificationContent(3, "fi", "Versiopäivitys 23.5 klo 16.30-17.00",
            "<p>Opintopolussa versiopäivitys tänään 23.5 klo 16:30-17:00. Hakemusten käsittely ja Oma Opintopolku alhaalla</p>")),
        List(Tag(2, "toinen aste"), Tag(3, "valinnat")))),
      List(TimelineItem(3, 5, LocalDate.of(2016, 5, 26),
        Map("fi" -> TimelineContent(2, "fi", "Opintopolussa versiopäivitys")))))
  )

  releases.set(initialReleases)

  val tags = List(
    Tag(1, "Aikataulut"),
    Tag(2, "Kielikoe"),
    Tag(3, "Koulutustarjonta"),
    Tag(4, "Käyttöoikeudet"),
    Tag(5, "Opintopolku-info")
  )

  def nextReleaseId(): Long = releases.get().values.map(_.id).max +1

  def notifications(): Iterable[Option[Notification]] = releases.get().values.map(_.notification)
  private def nextNotificationId = notifications().flatMap(_.map(_.id)).max + 1

  def getReleases : Future[IndexedSeq[Release]] = Future{
    releases.get().values.toIndexedSeq
  }

  def persistNotification(releaseId: Long, notification: Notification): Notification = {
    notification.copy(id = nextNotificationId, releaseId = releaseId)
  }

  def addRelease(release: Release): Future[Release] = {
    println("Received release: "+ release)
    val oldReleases = releases.get()
    val id = nextReleaseId()
    val persistedRelease = release.copy(
      id = id,
      notification = release.notification.map(persistNotification(id, _))
    )
    releases.set(oldReleases + (id -> persistedRelease))
    Future{persistedRelease}
  }
}
