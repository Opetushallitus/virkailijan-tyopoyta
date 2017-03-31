package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model.{Draft, User, UserProfile, UserProfileUpdate}

trait UserRepository {
  def setUserProfile(userId: String, userProfile: UserProfileUpdate): UserProfile
  def userProfile(userId: String): UserProfile

  def categoriesForUser(userId: String): Seq[Long]

  def fetchDraft(userId: String): Option[Draft]
  def saveDraft(user: User, draft: String)
}
