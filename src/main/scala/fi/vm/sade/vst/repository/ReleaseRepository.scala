package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model._
import java.time.{LocalDate, YearMonth}

trait ReleaseRepository{
  type RowIds = Option[Seq[Long]]

  def notifications(categories: RowIds, tags: RowIds, page: Int, user: User): NotificationList
  def notification(id: Long, user: User) : Option[Notification]
  def deleteNotification(id: Long): Int

  def unpublishedNotifications(user: User): Seq[Notification]

  def timeline(categories: RowIds, month: YearMonth, user: User): Timeline
  def deleteTimelineItem(id: Long): Int


  def tags(user: User): Seq[TagGroup]
  def categories(user: User): Seq[Category]

  def release(id: Long, user: User): Option[Release]

  def userGroupsForRelease(releaseId: Long): List[ReleaseUserGroup]
  def emailReleasesForDate(date: LocalDate): Seq[Release]
  def emailLogs: Seq[EmailEvent]

  def deleteRelease(id: Long): Int
  def addRelease(user: User, release: ReleaseUpdate): Option[Release]
  def updateRelease(user: User, release: ReleaseUpdate): Option[Release]

  def generateReleases(amount: Int, month: YearMonth, user: User): Seq[Release]




}