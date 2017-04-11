package fi.vm.sade.vst.repository

import fi.vm.sade.vst.DBConfig
import fi.vm.sade.vst.model._
import fi.vm.sade.vst.repository.Tables.{DraftTable, TargetingGroupTable, UserCategoryTable, UserProfileTable}
import scalikejdbc._

class DBUserRepository(val config: DBConfig) extends UserRepository with SessionInfo {

  val (u, uc, d, tg) = (UserProfileTable.syntax, UserCategoryTable.syntax, DraftTable.syntax, TargetingGroupTable.syntax)

  private def fetchUserProfile(userId: String) = withSQL[UserProfile] {
    select
      .from(UserProfileTable as u)
      .leftJoin(UserCategoryTable as uc).on(u.userId, uc.userId)
      .where.eq(u.userId, userId)
  }.one(UserProfileTable(u))
    .toMany(
      rs => UserCategoryTable.opt(uc)(rs)
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
      userProfileUpdate.categories.foreach(insertUserCategory(userId, _))
    }
    UserProfile(userId, userProfileUpdate.categories, userProfileUpdate.sendEmail, firstLogin = true)
  }

  private def insertUserCategory(userId: String, categoryId: Long)(implicit session: DBSession) = {
    val uc = UserCategoryTable.column
    DB localTx { implicit session =>
      withSQL {
        insert.into(UserCategoryTable).namedValues(
          uc.userId -> userId,
          uc.categoryId -> categoryId)
      }.update().apply()
    }
  }

  private def updateUserCategories(userId: String, categories: Seq[Long]) = {
    val existingCategories = withSQL(select.from(UserCategoryTable as uc).where.eq(uc.userId, userId))
      .map(UserCategoryTable(uc)).list.apply().map(_.categoryId)

    val deleted = existingCategories.diff(categories)
    val added = categories.diff(existingCategories)

    withSQL {
      delete.from(UserCategoryTable as uc).where.eq(uc.userId, userId).and.in(uc.categoryId, deleted)
    }.update().apply()
    added.foreach(insertUserCategory(userId, _))
  }

  private def updateUserProfile(userId: String, userProfileUpdate: UserProfileUpdate) = {
    DB localTx { implicit session =>
      val sql = withSQL(update(UserProfileTable as u).set(UserProfileTable.column.sendEmail -> userProfileUpdate.sendEmail).where.eq(u.userId, userId))
      sql.update().apply()
      updateUserCategories(userId, userProfileUpdate.categories)
    }
    UserProfile(userId, userProfileUpdate.categories, userProfileUpdate.sendEmail)
  }

  override def setUserProfile(user: User, userProfileData: UserProfileUpdate): UserProfile ={
    fetchUserProfile(user.userId) match {
      case Some(_) => updateUserProfile(user.userId, userProfileData)
      case None => insertUserProfile(user.userId, userProfileData)
    }
  }

  override def userProfile(userId: String): UserProfile = {
    fetchUserProfile(userId) match {
      case Some(userProfile) => userProfile
      case None => insertUserProfile(userId, UserProfileUpdate())
    }
  }

  override def userProfiles(userIds: Seq[String]): List[UserProfile] = {
    val result = withSQL[UserProfile] {
      select.from(UserProfileTable as u).where.in(u.userId, userIds)
    }
    result.map(UserProfileTable(u)).toList.apply()
  }

  override def fetchDraft(userId: String): Option[Draft] = {
    withSQL[Draft] {
      select.from(DraftTable as d).where.eq(d.userId, userId)
    }.map(DraftTable(d)).single().apply()
  }

  private def updateDraft(userId: String, data: String) = {
    withSQL{
      update(DraftTable as d).set(DraftTable.column.data -> data).where.eq(d.userId, userId)
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

  override def deleteDraft(user: User): Int = {
    withSQL(delete.from(DraftTable as d).where.eq(d.userId, user.userId)).update().apply()
  }

  override def saveDraft(user: User, data: String): Int = {
    val currentDraft = fetchDraft(user.userId)
      currentDraft match {
        case Some(_) => updateDraft(user.userId, data)
        case None => insertDraft(user.userId, data)
    }
  }

  def findTargetingGroups(user: User): Seq[TargetingGroup] = {
    withSQL[TargetingGroup]{
      select.from(TargetingGroupTable as tg).where.eq(tg.userId, user.userId)
    }.map(TargetingGroupTable(tg)).toList().apply()
  }

  def saveTargetingGroup(user: User, name: String, data: String): Int = {
    val column = TargetingGroupTable.column
    withSQL{
      insert.into(TargetingGroupTable).namedValues(
        column.userId -> user.userId,
        column.name -> name,
        column.data -> data)
    }.update().apply()
  }

  def deleteTargetingGroup(user: User, name: String, data: String): Int = {
    val column = TargetingGroupTable.column
    withSQL{
      insert.into(TargetingGroupTable).namedValues(
        column.userId -> user.userId,
        column.name -> name,
        column.data -> data)
    }.update().apply()
  }
}


