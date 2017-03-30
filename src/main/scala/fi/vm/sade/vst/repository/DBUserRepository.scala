package fi.vm.sade.vst.repository

import fi.vm.sade.vst.DBConfig
import fi.vm.sade.vst.model.{Draft, User, UserProfile, UserProfileUpdate}
import fi.vm.sade.vst.repository.Tables.{DraftTable, UserCategoryTable, UserProfileTable}
import scalikejdbc._

import scala.util.Try

class DBUserRepository(val config: DBConfig) extends UserRepository with SessionInfo {

  val (u, uc, d) = (UserProfileTable.syntax, UserCategoryTable.syntax, DraftTable.syntax)

  private def fetchUserProfile(userId: String) = withSQL[UserProfile] {
    select
      .from(UserProfileTable as u)
      .leftJoin(UserCategoryTable as uc).on(u.userId, uc.userId)
      .where.eq(u.userId, userId)
  }.one(UserProfileTable(u))
    .toMany(
      us => UserCategoryTable.opt(uc)(us)
    ).map((userProfile, categories) => userProfile.copy(categories = categories.map(_.categoryId)))
    .single.apply()

  private def insertUserProfile(userId: String, userProfileUpdate: UserProfileUpdate) = {
    val uc = UserProfileTable.column
    DB localTx { implicit session =>
      withSQL {
        insert.into(UserProfileTable).namedValues(
          uc.userId -> userId,
          uc.sendEmail -> userProfileUpdate.sendEmail)
      }.update().apply()
    }
    UserProfile(userId, userProfileUpdate.categories, userProfileUpdate.sendEmail, firstLogin = true)
  }

  private def insertUserCategory(userId: String, categoryId: Long) = {
    val uc = UserCategoryTable.column
    DB localTx { implicit session =>
      withSQL {
        insert.into(UserCategoryTable).namedValues(
          uc.userId -> userId,
          uc.categoryId -> categoryId)
      }.update().apply()
    }
  }

  private def updateUserProfile(userId: String, userProfileUpdate: UserProfileUpdate) = {
    DB localTx { implicit session =>
      withSQL {
        update(UserProfileTable).set(u.sendEmail -> userProfileUpdate.sendEmail).where.eq(u.userId, userId)
      }.update().apply()
      withSQL {
        delete.from(UserCategoryTable).where.eq(uc.userId, userId)
      }.update().apply()
      userProfileUpdate.categories.foreach(id => insertUserCategory(userId, id))
    }
    UserProfile(userId, userProfileUpdate.categories, userProfileUpdate.sendEmail)
  }

  override def setUserProfile(userId: String, userProfileData: UserProfileUpdate): UserProfile ={
    fetchUserProfile(userId) match {
      case Some(_) => updateUserProfile(userId, userProfileData)
      case None => insertUserProfile(userId, userProfileData)
    }
  }

  override def userProfile(userId: String): UserProfile = {
    fetchUserProfile(userId) match {
      case Some(userProfile) => userProfile
      case None => insertUserProfile(userId, UserProfileUpdate())
    }
  }

  override def categoriesForUser(oid: String): Seq[Long] = ???

  override def fetchDraft(userId: String): Option[Draft] = {
    withSQL[Draft] {
      select.from(DraftTable as d).where.eq(d.userId, userId)
    }.map(DraftTable(d)).single().apply()
  }

  private def updateDraft(userId: String, data: String) = {
    withSQL{
      update(DraftTable).set(d.data -> data).where.eq(d.userId, userId)
    }.update().apply()
  }

  private def insertDraft(userId: String, data: String) = {
    val column = DraftTable.column
    withSQL{
      insert.into(DraftTable).namedValues(
        column.userId -> userId,
        column.data -> data
      )
    }.update().apply()
  }

  override def saveDraft(user: User, data: String): Unit = {
    val currentDraft = fetchDraft(user.userId)
    Try{
      currentDraft match {
        case Some(_) => updateDraft(user.userId, data)
        case None => insertDraft(user.userId, data)
      }
    }
  }
}
