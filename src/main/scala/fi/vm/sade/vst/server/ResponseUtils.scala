package fi.vm.sade.vst.server

import akka.http.scaladsl.model.ContentTypes.`application/json`
import akka.http.scaladsl.model.{HttpEntity, HttpResponse, StatusCodes}
import akka.http.scaladsl.server.{Directives, Route}
import com.typesafe.scalalogging.LazyLogging
import play.api.libs.json.{Json, Writes}

import scala.concurrent.Future
import scala.util.{Failure, Success}

trait ResponseUtils extends Directives with LazyLogging {

  private def internalServerError(e: Throwable): Route = {
    logger.error(s"Exception in route execution", e)
    complete(StatusCodes.InternalServerError, e.getMessage)
  }

  def sendResponse[T](eventualResult: Future[T])(implicit writes: Writes[T]): Route = {
    onComplete(eventualResult) {
      case Success(result) ⇒
        logger.info(s"Successfully handled route with result ${result.toString}")
        complete {
          HttpResponse(entity = HttpEntity(`application/json`, Json.toJson(result).toString()))
        }
      case Failure(e) ⇒
        internalServerError(e)
    }
  }

  def sendOptionalResponse[T](optionalResult: Future[Option[T]])(implicit writes: Writes[T]): Route = {
    onComplete(optionalResult) {
      case Success(result) => result match {
        case Some(_) =>
          sendResponse(optionalResult)
        case None =>
          complete(StatusCodes.NotFound)
      }
      case Failure(e) =>
        internalServerError(e)
    }
  }
}