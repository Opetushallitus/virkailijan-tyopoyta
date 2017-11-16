package fi.vm.sade.vst.service

import java.time.YearMonth

import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.model._
import fi.vm.sade.vst.repository.ReleaseRepository


class ReleaseService(releaseRepository: ReleaseRepository) {

  def notifications(categories: Seq[Long], tags: Seq[Long], page: Int, user: User): NotificationList = {
    releaseRepository.notifications(categories, tags, page, user)
  }

  def notification(id: Long, user: User): Option[Notification] = {
    releaseRepository.notification(id, user)
  }

  def specialNotifications(user: User): Seq[Notification] = {
    releaseRepository.specialNotifications(user)
  }

  def deleteNotification(user: User, id: Long)(implicit au: AuditUser): Int = {
    releaseRepository.deleteNotification(user, id)
  }

  def unpublishedNotifications(user: User): Seq[Notification] = {
    releaseRepository.unpublishedNotifications(user)
  }

  def timeline(categories: Seq[Long], month: YearMonth, user: User): Timeline = {
    val cats: Seq[Long] = if (categories.nonEmpty) categories else user.allowedCategories
    releaseRepository.timeline(cats, month, user)
  }

  def deleteTimelineItem(id: Long): Int = {
    releaseRepository.deleteTimelineItem(id)
  }

  def tags(user: User): Seq[TagGroup] = {
    releaseRepository.tags(user)
        .map(tg => tg.copy(tags = tg.tags.sortBy(_.name)))
  }

  def categories(user: User): Seq[Category] = {
    releaseRepository.categories(user)
  }

  def serviceCategories: Seq[Category] = {
    releaseRepository.serviceCategories
  }

  def getReleaseForUser(id: Long, user: User): Option[Release] = {
    releaseRepository.getReleaseForUser(id, user)
  }

  def userGroupsForRelease(releaseId: Long): List[ReleaseUserGroup] = {
    releaseRepository.userGroupsForRelease(releaseId)
  }

  def deleteRelease(user: User, id: Long)(implicit au: AuditUser): Int = {
    releaseRepository.deleteRelease(user, id)
  }

  def addRelease(user: User, release: ReleaseUpdate)(implicit au: AuditUser): Option[Release] = {

    releaseRepository.addRelease(user, release)
  }

  def updateRelease(user: User, release: ReleaseUpdate)(implicit au: AuditUser): Option[Release] = {
    releaseRepository.updateRelease(user, release)
  }
}
