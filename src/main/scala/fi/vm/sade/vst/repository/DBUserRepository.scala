package fi.vm.sade.vst.repository

import fi.vm.sade.vst.DBConfig
import fi.vm.sade.vst.model.UserProfile
import fi.vm.sade.vst.repository.Tables.{UserCategoryTable, UserProfileTable}
import scalikejdbc.select
import scalikejdbc._

class DBUserRepository(val config: DBConfig) extends UserRepository with SessionInfo {

  val (u, uc) = (UserProfileTable.syntax, UserCategoryTable.syntax)

  override def setUserProfile(uid: String, categories: Option[Seq[Long]], email: Boolean): Option[UserProfile] = ???

  override def userProfile(uid: String): Option[UserProfile] = {
    withSQL[UserProfile]{
      select
        .from(UserProfileTable as u)
        .leftJoin(UserCategoryTable as uc).on(u.uid, uc.userId)
        .where.eq(u.uid, uid)
    }.one(UserProfileTable(u))
      .toMany(
        us => UserCategoryTable.opt(uc)(us)
      ).map( (userProfile, categories) => userProfile.copy(categories = categories.map(_.categoryId)))
      .single.apply()
  }
}
