package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model._
import java.time.YearMonth

trait ReleaseRepository{
  type RowIds = Option[Seq[Long]]

  def notifications(categories: RowIds, tags: RowIds, page: Int): NotificationList
  def timeline(categories: RowIds, month: YearMonth): Timeline
  def tags: Seq[TagGroup]
  def categories(user: User): Seq[Category]
  def release(id: Long): Option[Release]
  def notification(id: Long) : Option[Notification]
  def unpublishedNotifications: Seq[Notification]
  def releases: Iterable[Release]

  def deleteRelease(id: Long): Int
  def addRelease(uid: String, release: ReleaseUpdate): Option[Release]
  def updateRelease(uid: String, release: ReleaseUpdate): Option[Release]
  def generateReleases(amount: Int, month: YearMonth): Seq[Release]

}