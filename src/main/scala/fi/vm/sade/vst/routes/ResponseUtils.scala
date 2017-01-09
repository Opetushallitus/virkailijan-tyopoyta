package fi.vm.sade.vst.routes

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._

import scala.concurrent.Future
import scala.util.{Failure, Success}
import play.api.libs.json.{Json, Writes}

trait ResponseUtils {

  def sendResponse[T](eventualResult: Future[T])(implicit writes: Writes[T]): Route = {
    onComplete(eventualResult) {
      case Success(result) ⇒
        complete(Json.toJson(result).toString())
      case Failure(e) ⇒
        complete(ToResponseMarshallable("Error"))
    }
  }
}