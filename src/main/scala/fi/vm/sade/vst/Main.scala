package fi.vm.sade.vst

import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.vst.module.ServerModule
import fi.vm.sade.vst.server.Server

object Main extends App with ServerModule with Configuration with LazyLogging {

  import com.softwaremill.macwire._

  val server = wire[Server]

  migrations.run()
  logger.info("Fetching service user groups")
  val groups = userService.serviceUserGroups
  logger.info(s"Found ${groups.length} groups")
  server.start()
  quartzScheduler.init()
}
