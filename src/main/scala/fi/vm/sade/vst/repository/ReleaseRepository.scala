package fi.vm.sade.vst.repository

import java.time.YearMonth

import fi.vm.sade.vst.model._

import scala.collection.immutable.Seq
import scala.concurrent.Future

trait ReleaseRepository{

  type RowIds = Option[Seq[Long]]

  def notifications(categories: RowIds, tags: RowIds, page: Int) : Future[Seq[Notification]]
  def timeline(categories: RowIds, month: YearMonth) : Future[Timeline]
  def tags: Future[Seq[Tag]]
  def categories: Future[Seq[Category]]
  def release(id: Long): Future[Option[Release]]
  def releases: Future[Iterable[Release]]

  def deleteRelease(id: Long): Future[Int]
  def addRelease(release: ReleaseUpdate) : Future[Release]

  def generateReleases(amount: Int, month: YearMonth) : Future[Seq[Release]]
}