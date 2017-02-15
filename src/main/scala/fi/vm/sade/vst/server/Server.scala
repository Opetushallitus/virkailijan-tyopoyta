package fi.vm.sade.vst.server

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import fi.vm.sade.vst.ServerConfig

class Server(routes: Routes, config: ServerConfig) {

  implicit val system = ActorSystem("vst-actorsystem")
  implicit val materializer = ActorMaterializer()

  implicit val executionContext = system.dispatcher

  lazy val port = config.port

  def start(): Unit = {
    val handler = Http().bindAndHandle(routes.routes, "localhost", port)

    handler.failed.foreach {case ex : Exception => println(ex, "Failed to bind to port")}
  }
}