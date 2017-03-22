package fi.vm.sade.vst.repository

import fi.vm.sade.vst.DBConfig
import fi.vm.sade.vst.model.{UserProfile, UserProfileUpdate}
import fi.vm.sade.vst.repository.Tables.{NotificationContentTable, UserCategoryTable, UserProfileTable}
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

  private def insertUserProfile(uid: String, userProfileUpdate: UserProfileUpdate) = {
    val uc = UserProfileTable.column
    DB localTx { implicit session =>
      withSQL {
        insert.into(UserProfileTable).namedValues(
          uc.uid -> uid,
          uc.sendEmail -> userProfileUpdate.sendEmail)
      }.update().apply()
    }
    UserProfile(uid, userProfileUpdate.categories, userProfileUpdate.sendEmail)
  }

  private def insertUserCategory(uid: String, categoryId: Long) = {
    val uc = UserCategoryTable.column
    DB localTx { implicit session =>
      withSQL {
        insert.into(UserCategoryTable).namedValues(
          uc.userId -> uid,
          uc.categoryId -> categoryId)
      }.update().apply()
    }
  }

  private def updateUserProfile(uid: String, userProfileUpdate: UserProfileUpdate) = {
    DB localTx { implicit session =>
      withSQL {
        update(UserProfileTable).set(u.sendEmail -> userProfileUpdate.sendEmail).where.eq(u.uid,uid)
      }.update().apply()
      withSQL {
        delete.from(UserCategoryTable).where.eq(uc.userId,uid)
      }.update().apply()
      userProfileUpdate.categories.foreach(id => insertUserCategory(uid,id))
    }
    UserProfile(uid, userProfileUpdate.categories, userProfileUpdate.sendEmail)
  }

  override def setUserProfile(uid: String, userProfileData: UserProfileUpdate): UserProfile ={
    fetchUserProfile(uid) match {
      case Some(userProfile) => updateUserProfile(uid, userProfileData)
      case None => insertUserProfile(uid, userProfileData)
    }
  }

  override def userProfile(uid: String): UserProfile = {
    fetchUserProfile(uid) match {
      case Some(userProfile) => userProfile
      case None => insertUserProfile(uid, UserProfileUpdate())
    }
  }
}
