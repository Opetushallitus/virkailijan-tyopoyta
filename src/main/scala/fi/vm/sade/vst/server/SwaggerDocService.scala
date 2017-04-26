package fi.vm.sade.vst.server

import akka.actor.ActorSystem
import akka.http.scaladsl.server.Route
import akka.stream.ActorMaterializer
import com.github.swagger.akka.model.Info
import com.github.swagger.akka.{HasActorSystem, SwaggerHttpService}
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.server.routes._

import scala.reflect.runtime.{universe => ru}

class SwaggerDocService(system: ActorSystem) extends SwaggerHttpService with HasActorSystem with Configuration{
  override implicit val actorSystem: ActorSystem = system
  override implicit val materializer: ActorMaterializer = ActorMaterializer()
  override val apiTypes = Seq(ru.typeOf[ReleaseRoutes], ru.typeOf[NotificationRoutes], ru.typeOf[TimelineRoutes],
    ru.typeOf[UserRoutes], ru.typeOf[GeneralRoutes], ru.typeOf[LoginRoutes], ru.typeOf[EmailRoutes])
  override val host = "localhost:8081" //the url of your api, not swagger's json endpoint
  override val basePath = "/virkailijan-tyopoyta"    //the basePath for the API you are exposing
  override val apiDocsPath = "swagger" //where you want the swagger-json endpoint exposed
  override val info = Info(version = "1.0")//provides license and other description details

  val swaggerRoutes: Route = path("swagger") {
    getFromResource("swagger/index.html")
  } ~
  getFromResourceDirectory("swagger") ~
  routes
}
