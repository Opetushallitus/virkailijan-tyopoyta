package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model.{UserProfile, UserProfileUpdate}

trait UserRepository {
  def setUserProfile(userId: String, userProfile: UserProfileUpdate): UserProfile
  def userProfile(userId: String): UserProfile

  def categoriesForUser(userId: String): Seq[Long]
}
