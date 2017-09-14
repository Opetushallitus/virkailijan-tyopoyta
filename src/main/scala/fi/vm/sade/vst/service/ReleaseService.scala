package fi.vm.sade.vst.service

import java.time.{LocalDate, YearMonth}

import fi.vm.sade.vst.model._
import fi.vm.sade.vst.repository.ReleaseRepository


class ReleaseService(releaseRepository: ReleaseRepository) {

  def notifications(categories: Seq[Long], tags: Seq[Long], page: Int, user: User): NotificationList =
    releaseRepository.notifications(categories, tags, page, user)

  def notification(id: Long, user: User): Option[Notification] = releaseRepository.notification(id, user)
  def specialNotifications(user: User): Seq[Notification] = releaseRepository.specialNotifications(user)
  def deleteNotification(user: User, id: Long): Int = releaseRepository.deleteNotification(user, id)
  def unpublishedNotifications(user: User): Seq[Notification] = releaseRepository.unpublishedNotifications(user)

  def timeline(categories: Seq[Long], month: YearMonth, user: User): Timeline = {
    val cats: Seq[Long] = if (categories.nonEmpty) categories else user.allowedCategories
    releaseRepository.timeline(cats, month, user)
  }

  def deleteTimelineItem(id: Long): Int = releaseRepository.deleteTimelineItem(id)

  def tags(user: User): Seq[TagGroup] = releaseRepository.tags(user)
  def categories(user: User): Seq[Category] = releaseRepository.categories(user)
  def serviceCategories: Seq[Category] = releaseRepository.serviceCategories

  def release(id: Long, user: User): Option[Release] = releaseRepository.release(id, user)

  def userGroupsForRelease(releaseId: Long): List[ReleaseUserGroup] = releaseRepository.userGroupsForRelease(releaseId)
  def emailReleasesForDate(date: LocalDate): Seq[Release] = releaseRepository.emailReleasesForDate(date)

  def deleteRelease(user: User, id: Long): Int = releaseRepository.deleteRelease(user, id)
  def addRelease(user: User, release: ReleaseUpdate): Option[Release] = releaseRepository.addRelease(user, release)
  def updateRelease(user: User, release: ReleaseUpdate): Option[Release] = releaseRepository.updateRelease(user, release)
}
