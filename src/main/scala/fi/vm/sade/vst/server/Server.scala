package fi.vm.sade.vst.server

import akka.Done
import akka.actor.ActorSystem
import akka.dispatch.MessageDispatcher
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import com.typesafe.scalalogging.LazyLogging
import de.heikoseeberger.accessus.Accessus._
import fi.vm.sade.vst.ServerConfig
import fi.vm.sade.vst.logging.AccessLogger

import scala.concurrent.Future

class Server(routes: Routes, config: ServerConfig, implicit val system: ActorSystem) extends LazyLogging {

  implicit val materializer: ActorMaterializer = ActorMaterializer()

  implicit val blockingDispatcher: MessageDispatcher = system.dispatchers.lookup("blocking-dispatcher")

  private lazy val port = config.port

  private val accessLogger = new AccessLogger()

  private val route: Handler[Future[Done]] = routes.routes.withAccessLog(accessLogger())

  def start(): Unit = {
    System.setProperty("logback.debug", "true")
    assertNoSlf4jLog4jOnClasspath()
    val handler = Http().bindAndHandle(route, "0.0.0.0", port)
    logger.info(s"Starting server on port $port")
    handler.failed.foreach { case ex: Exception => logger.error("Failed to bind to port", ex) }
  }

  private def assertNoSlf4jLog4jOnClasspath(): Unit = {
    assertNotOnClassPath(
      errorMessage = "This might break logback logging. Please remove log4j from and its bindings from the classpath.",
      classNames = Seq("org.slf4j.impl.Log4jLoggerFactory", "org.apache.log4j.Logger"))
  }

  def assertNotOnClassPath(errorMessage: String, classNames: Seq[String]): Unit = {
    classNames.foreach { fullyQualifiedName =>
      try {
        Class.forName(fullyQualifiedName)
        throw new IllegalStateException(s"${getClass.getName} found unexpected class $fullyQualifiedName on the classpath: $errorMessage")
      } catch {
        case _: ClassNotFoundException =>
      }
    }
  }
}
