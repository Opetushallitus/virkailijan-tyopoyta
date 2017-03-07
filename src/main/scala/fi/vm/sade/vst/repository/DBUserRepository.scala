package fi.vm.sade.vst.repository

import fi.vm.sade.vst.DBConfig
import fi.vm.sade.vst.model.{UserProfile, UserProfileUpdate}
import fi.vm.sade.vst.repository.Tables.{UserCategoryTable, UserProfileTable}
import scalikejdbc._

class DBUserRepository(val config: DBConfig) extends UserRepository with SessionInfo {

  val (u, uc) = (UserProfileTable.syntax, UserCategoryTable.syntax)

  private def fetchUserProfile(uid: String) = withSQL[UserProfile] {
    select
      .from(UserProfileTable as u)
      .leftJoin(UserCategoryTable as uc).on(u.uid, uc.userId)
      .where.eq(u.uid, uid)
  }.one(UserProfileTable(u))
    .toMany(
      us => UserCategoryTable.opt(uc)(us)
    ).map((userProfile, categories) => userProfile.copy(categories = categories.map(_.categoryId)))
    .single.apply()

  override def setUserProfile(uid: String, userProfileData: UserProfileUpdate): UserProfile ={

    DB localTx { implicit session =>
      withSQL {
        update(UserProfileTable).set(u.sendEmail -> userProfileData.sendEmail)
      }.update().apply()
    }

    userProfile(uid)
  }

  override def userProfile(uid: String): UserProfile = {
    fetchUserProfile(uid) match {
      case Some(userProfile) => userProfile
      case None => setUserProfile(uid, UserProfileUpdate())
    }
  }
}
