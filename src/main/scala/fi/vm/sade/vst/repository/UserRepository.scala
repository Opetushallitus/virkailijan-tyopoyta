package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model.UserProfile

trait UserRepository {
  def setUserProfile(uid: String, categories: Option[Seq[Long]], email: Boolean): Option[UserProfile]
  def userProfile(uid: String): Option[UserProfile]
}
