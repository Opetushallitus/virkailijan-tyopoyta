package fi.vm.sade.vst.server

import akka.actor.ActorSystem
import akka.dispatch.MessageDispatcher
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import fi.vm.sade.vst.ServerConfig

class Server(routes: Routes, config: ServerConfig) {

  implicit val system = ActorSystem("vst-actorsystem", config.actorSystemConfig)
  implicit val materializer = ActorMaterializer()

  implicit val blockingDispatcher: MessageDispatcher = system.dispatchers.lookup("blocking-dispatcher")

  private lazy val port = config.port

  def start(): Unit = {
    val handler = Http().bindAndHandle(routes.routes, "::0", port)
    println(s"Starting server on port $port")
    handler.failed.foreach {case ex : Exception => println(ex, "Failed to bind to port")}
  }
}