package fi.vm.sade.vst.server

import akka.Done
import akka.event.{Logging, LoggingAdapter}
import akka.stream.scaladsl.Sink
import de.heikoseeberger.accessus.Accessus._

import scala.concurrent.Future
import akka.actor.ActorSystem
import akka.dispatch.MessageDispatcher
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import fi.vm.sade.vst.{Logging, ServerConfig}

class Server(routes: Routes, config: ServerConfig, implicit val system: ActorSystem) extends Logging {

  implicit val materializer: ActorMaterializer = ActorMaterializer()

  implicit val blockingDispatcher: MessageDispatcher = system.dispatchers.lookup("blocking-dispatcher")

  private lazy val port = config.port

  private def accessLog(accessLogger: LoggingAdapter): AccessLog[Long, Future[Done]] =
    Sink.foreach {
      case ((req, t0), res) =>
        val m = req.method.value
        val p = req.uri.path.toString
        val s = res.status.intValue()
        val t = (System.nanoTime() - t0) / 1000
        accessLogger.info(s"$m $p $s $t")
    }

  private val route: Handler[Future[Done]] = routes.routes.withAccessLog(accessLog(Logging(system, "ACCESS_LOG")))

  def start(): Unit = {
    val handler = Http().bindAndHandle(route, "0.0.0.0", port)
    logger.info(s"Starting server on port $port")
    handler.failed.foreach { case ex: Exception => logger.error("Failed to bind to port", ex) }
  }
}