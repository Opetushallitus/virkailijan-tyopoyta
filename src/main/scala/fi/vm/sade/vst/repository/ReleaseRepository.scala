package fi.vm.sade.vst.repository

import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.model._
import java.time.{LocalDate, YearMonth}

trait ReleaseRepository {
  def notifications(categories: Seq[Long], tags: Seq[Long], page: Int, user: User): NotificationList
  def notification(id: Long, user: User): Option[Notification]
  def specialNotifications(user: User): Seq[Notification]
  def deleteNotification(user: User, id: Long)(implicit au: AuditUser): Int

  def unpublishedNotifications(user: User): Seq[Notification]

  def timeline(categories: Seq[Long], month: YearMonth, user: User): Timeline
  def deleteTimelineItem(id: Long): Int

  def tags(user: User): Seq[TagGroup]
  def categories(user: User): Seq[Category]
  def serviceCategories: Seq[Category]

  def getReleaseForUser(id: Long, user: User): Option[Release]

  def userGroupsForRelease(releaseId: Long): List[ReleaseUserGroup]
  def getEmailReleasesForDate(date: LocalDate): Seq[Release]

  def deleteRelease(user: User, id: Long)(implicit au: AuditUser): Int
  def addRelease(user: User, release: ReleaseUpdate)(implicit au: AuditUser): Option[Release]
  def updateRelease(user: User, release: ReleaseUpdate)(implicit au: AuditUser): Option[Release]

  def generateReleases(amount: Int, month: YearMonth, user: User)(implicit au: AuditUser): Seq[Release]
}