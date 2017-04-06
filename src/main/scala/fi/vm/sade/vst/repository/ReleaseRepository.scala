package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model._
import java.time.{LocalDate, YearMonth}

trait ReleaseRepository{
  type RowIds = Option[Seq[Long]]

  def notifications(categories: RowIds, tags: RowIds, page: Int, user: User): NotificationList
  def notification(id: Long, user: User) : Option[Notification]
  def deleteNotification(id: Long): Int

  def unpublishedNotifications: Seq[Notification]

  def timeline(categories: RowIds, month: YearMonth, user: User): Timeline
  def deleteTimelineItem(id: Long): Int


  def tags(user: User): Seq[TagGroup]
  def categories(user: User): Seq[Category]

  //TODO: add user
  def release(id: Long): Option[Release]
  //TODO: is this actually used?
  def releases: Iterable[Release]

  def userGroupsForRelease(releaseId: Long): List[ReleaseUserGroup]
  def emailReleasesForDate(date: LocalDate): Seq[Release]
  def emailLogs: Seq[EmailEvent]

  def deleteRelease(id: Long): Int
  def addRelease(uid: String, release: ReleaseUpdate): Option[Release]
  def updateRelease(uid: String, release: ReleaseUpdate): Option[Release]

  def generateReleases(amount: Int, month: YearMonth): Seq[Release]




}