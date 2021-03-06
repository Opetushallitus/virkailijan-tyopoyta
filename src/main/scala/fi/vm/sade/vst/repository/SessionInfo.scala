package fi.vm.sade.vst.repository

import fi.vm.sade.vst.DBConfig
import scalikejdbc.{ConnectionPoolSettings, ConnectionPool, AutoSession}

/**
  * Created by outa on 17/02/2017.
  */
trait SessionInfo {
  val config: DBConfig
  val pageLength: Int = config.pageLength
  implicit val session = AutoSession

  Class.forName(config.driver)
  val poolSettings = ConnectionPoolSettings(config.dbPoolConfig.initialiSize,
    config.dbPoolConfig.maxSize,
    config.dbPoolConfig.connectionTimeoutMillis,
    config.dbPoolConfig.validationQuery)
  ConnectionPool.singleton(config.url, config.username, config.password, poolSettings)

  def offset(page: Int): Int = {
    math.max(page - 1, 0) * pageLength
  }
}
