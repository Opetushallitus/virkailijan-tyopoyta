package fi.vm.sade.vst

import java.io.File
import java.nio.file.Paths

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import com.typesafe.config.ConfigFactory
import fi.vm.sade.vst.routes.Routes

import scala.io.StdIn

object Server extends App {

  private lazy val homeDir = sys.props.getOrElse("user.home", "")
  lazy val confFile: File = Paths.get(homeDir, "/oph-configuration/common.properties").toFile

  println("Reading configuration from " + confFile.toString)
  val config = ConfigFactory.parseFile(confFile)

  implicit val system = ActorSystem("vst-actorsystem")
  implicit val materializer = ActorMaterializer()

  implicit val executionContext = system.dispatcher

  val port = config.getInt("server.port")
  val handler = Http().bindAndHandle(Routes.routes, "localhost", port)

  handler.failed.foreach {case ex : Exception => println(ex, "Failed to bind to port")}

  StdIn.readLine(s"\nHTTP server running on port $port, press any key to stop")
  handler.flatMap(_.unbind()).onComplete(_ => system.terminate())

}