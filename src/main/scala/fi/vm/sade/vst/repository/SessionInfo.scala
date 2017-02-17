package fi.vm.sade.vst.repository

import fi.vm.sade.vst.DBConfig
import scalikejdbc.{ConnectionPool, AutoSession}

/**
  * Created by outa on 17/02/2017.
  */
trait SessionInfo {
  val config: DBConfig
  val pageLength: Int = config.pageLength
  implicit val session = AutoSession

  Class.forName(config.driver)
  ConnectionPool.singleton(config.url, config.username, config.password)

  def offset(page: Int) = math.max(page-1, 0) * pageLength
}
