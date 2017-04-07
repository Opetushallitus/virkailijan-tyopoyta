package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model.{Draft, User, UserProfile, UserProfileUpdate}

trait UserRepository {
  def setUserProfile(user: User, userProfile: UserProfileUpdate): UserProfile
  def userProfile(userId: String): UserProfile
  def userProfiles(userIds: Seq[String]): List[UserProfile]

  def fetchDraft(userId: String): Option[Draft]
  def saveDraft(user: User, draft: String)
}
