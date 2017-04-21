package fi.vm.sade.vst

import fi.vm.sade.vst.module.ServerModule
import fi.vm.sade.vst.server.Server

object Main extends App with ServerModule with Configuration {

  import com.softwaremill.macwire._

  val server = wire[Server]

  migrations.run()
  println("Fetching service user groups")
  val groups = userService.serviceUserGroups
  println(s"Found ${groups.length} groups")
  server.start()
  quartzScheduler.init()
}
