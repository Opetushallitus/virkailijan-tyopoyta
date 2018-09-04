package fi.vm.sade.vst.repository

import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.DBConfig
import fi.vm.sade.vst.logging.AuditLogging
import fi.vm.sade.vst.model._
import fi.vm.sade.vst.repository.Tables.{DraftTable, TargetingGroupTable, UserCategoryTable, UserProfileTable}
import scalikejdbc._

class DBUserRepository(val config: DBConfig) extends UserRepository with SessionInfo with LazyLogging with AuditLogging {

  val (u, uc, d, tg) = (UserProfileTable.syntax, UserCategoryTable.syntax, DraftTable.syntax, TargetingGroupTable.syntax)

  private def fetchUserProfile(userId: String): Option[UserProfile] = {
    withSQL[UserProfile] {
      select
        .from(UserProfileTable as u)
        .leftJoin(UserCategoryTable as uc).on(u.userId, uc.userId)
        .where.eq(u.userId, userId)
    }.one(UserProfileTable(u))
      .toMany(
        rs => UserCategoryTable.opt(uc)(rs)
      ).map((userProfile, categories) => userProfile.copy(categories = categories.map(_.categoryId)))
      .single.apply()
  }

  private def insertUserProfile(userId: String, userProfileUpdate: UserProfileUpdate): UserProfile = {
    val uc = UserProfileTable.column
    DB localTx { implicit session =>
      withSQL {
        insert.into(UserProfileTable).namedValues(
          uc.userId -> userId,
          uc.sendEmail -> userProfileUpdate.sendEmail.getOrElse(true))
      }.update().apply()
      userProfileUpdate.categories.foreach(insertUserCategory(userId, _))
    }
    UserProfile(userId, userProfileUpdate.categories, userProfileUpdate.sendEmail.getOrElse(true), firstLogin = true)
  }

  private def insertUserCategory(userId: String, categoryId: Long)(implicit session: DBSession): Int = {
    val uc = UserCategoryTable.column
    DB localTx { implicit session =>
      withSQL {
        insert.into(UserCategoryTable).namedValues(
          uc.userId -> userId,
          uc.categoryId -> categoryId)
      }.update().apply()
    }
  }

  private def updateUserCategories(userId: String, categories: Seq[Long]): Unit = {
    val existingCategories = withSQL(select.from(UserCategoryTable as uc).where.eq(uc.userId, userId))
      .map(UserCategoryTable(uc)).list.apply().map(_.categoryId)

    val deleted = existingCategories.diff(categories)
    val added = categories.diff(existingCategories)

    withSQL {
      delete.from(UserCategoryTable as uc).where.eq(uc.userId, userId).and.in(uc.categoryId, deleted)
    }.update().apply()
    added.foreach(insertUserCategory(userId, _))
  }

  private def updateUserProfile(userId: String, existingProfile: UserProfile, userProfileUpdate: UserProfileUpdate)(implicit au: AuditUser): UserProfile = {
    DB localTx { implicit session =>
      if(userProfileUpdate.sendEmail.isDefined) {
        val sql = withSQL(update(UserProfileTable as u).set(UserProfileTable.column.sendEmail -> userProfileUpdate.sendEmail.get).where.eq(u.userId, userId))
        sql.update().apply()
      }
      updateUserCategories(userId, userProfileUpdate.categories)
    }

    val oldProfile: UserProfileUpdate = UserProfileUpdate(
      categories =  existingProfile.categories,
      sendEmail = Some(existingProfile.sendEmail)
    )

    AuditLog.auditUpdateUserProfile(userId, oldProfile, userProfileUpdate)
    UserProfile(userId, userProfileUpdate.categories, userProfileUpdate.sendEmail.getOrElse(existingProfile.sendEmail))
  }

  override def setUserProfile(user: User, userProfileData: UserProfileUpdate)(implicit au: AuditUser): UserProfile = {
    fetchUserProfile(user.userId) match {
      case Some(existingProfile) =>
        updateUserProfile(user.userId, existingProfile, userProfileData)
      case None =>
        insertUserProfile(user.userId, userProfileData)
    }
  }

  override def userProfile(userId: String): UserProfile = {
    fetchUserProfile(userId) match {
      case Some(userProfile) =>
        userProfile
      case None =>
        insertUserProfile(userId, UserProfileUpdate())
    }
  }

  override def userProfiles(userIds: Seq[String]): List[UserProfile] = {
    val result = withSQL[UserProfile] {
      select.from(UserProfileTable as u).where.in(u.userId, userIds)
    }
    result.map(UserProfileTable(u)).toList.apply()
  }

  override def fetchDraft(userId: String): Option[Draft] = {
    logger.debug(s"Fetching draft for user $userId")
    withSQL[Draft] {
      select.from(DraftTable as d).where.eq(d.userId, userId)
    }.map(DraftTable(d)).single().apply()
  }

  private def updateDraft(userId: String, data: String) = {
    withSQL {
      update(DraftTable as d).set(DraftTable.column.data -> data).where.eq(d.userId, userId)
    }.update().apply()
  }

  private def insertDraft(userId: String, data: String) = {
    val column = DraftTable.column
    withSQL {
      insert.into(DraftTable).namedValues(
        column.userId -> userId,
        column.data -> data
      )
    }.update().apply()
  }

  override def deleteDraft(user: User): Int = {
    logger.info(s"Deleting draft for user ${user.userId}")
    withSQL(delete.from(DraftTable as d).where.eq(d.userId, user.userId)).update().apply()
  }

  override def saveDraft(user: User, data: String): Int = {
    logger.info(s"Saving draft for user ${user.userId}")
    val currentDraft = fetchDraft(user.userId)
    currentDraft match {
      case Some(_) =>
        updateDraft(user.userId, data)
      case None =>
        insertDraft(user.userId, data)
    }
  }

  override def findTargetingGroups(user: User): Seq[TargetingGroup] = {
    withSQL[TargetingGroup] {
      select.from(TargetingGroupTable as tg).where.eq(tg.userId, user.userId)
    }.map(TargetingGroupTable(tg)).toList().apply()
  }

  private def targetingGroup(id: Long): Option[TargetingGroup] = {
    withSQL(select.from(TargetingGroupTable as tg).where.eq(tg.id, id)).map(TargetingGroupTable(tg)).single().apply()
  }

  override def saveTargetingGroup(user: User, name: String, data: String): Option[TargetingGroup] = {
    val column = TargetingGroupTable.column
    val id = withSQL {
      insert.into(TargetingGroupTable).namedValues(
        column.userId -> user.userId,
        column.name -> name,
        column.data -> data)
    }.updateAndReturnGeneratedKey().apply()

    targetingGroup(id)
  }

  override def deleteTargetingGroup(user: User, id: Long): Int = {
    withSQL {
      delete.from(TargetingGroupTable as tg).where.eq(tg.userId, user.userId).and.eq(tg.id, id)
    }.update().apply()
  }
}


