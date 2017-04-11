package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model._

trait UserRepository {
  def setUserProfile(user: User, userProfile: UserProfileUpdate): UserProfile
  def userProfile(userId: String): UserProfile
  def userProfiles(userIds: Seq[String]): List[UserProfile]

  def findTargetingGroups(user: User): Seq[TargetingGroup]
  def saveTargetingGroup(user: User, name: String, data: String): Option[TargetingGroup]
  def deleteTargetingGroup(user: User, id: Long): Int

  def fetchDraft(userId: String): Option[Draft]
  def saveDraft(user: User, draft: String): Int
  def deleteDraft(user: User): Int
}
