package fi.vm.sade.vst

import fi.vm.sade.vst.server.{ServerModule, Server}

object Main extends App with ServerModule with Configuration {

  import com.softwaremill.macwire._

  val server = wire[Server]

  migrations.run()
  println("Fetching service user groups")
  val groups = userService.serviceUserGroups
  server.start()
  quartzScheduler.init()
}
