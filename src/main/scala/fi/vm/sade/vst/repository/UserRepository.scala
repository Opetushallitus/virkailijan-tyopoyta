package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model.{UserProfile, UserProfileUpdate}

trait UserRepository {
  def setUserProfile(uid: String, userProfile: UserProfileUpdate): Option[UserProfile]
  def userProfile(uid: String): Option[UserProfile]
}
