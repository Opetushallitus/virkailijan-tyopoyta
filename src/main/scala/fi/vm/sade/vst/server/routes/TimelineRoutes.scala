package fi.vm.sade.vst.server.routes

import java.time.YearMonth
import javax.ws.rs.Path

import akka.http.scaladsl.server.{Directives, Route}
import akka.http.scaladsl.unmarshalling.PredefinedFromStringUnmarshallers.CsvSeq
import fi.vm.sade.vst.Logging
import fi.vm.sade.vst.model.{JsonSupport, Timeline}
import fi.vm.sade.vst.security.UserService
import fi.vm.sade.vst.server.{ResponseUtils, SessionSupport}
import fi.vm.sade.vst.service.ReleaseService
import io.swagger.annotations._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Api(value = "Aikajanaan liittyvät rajapinnat", produces = "application/json")
@Path("/timeline")
class TimelineRoutes(val userService: UserService, releaseService: ReleaseService)
  extends Directives with SessionSupport with JsonSupport with ResponseUtils with Logging {

  private def parseMonth(year: Option[Int], month: Option[Int]) = (year, month) match {
    case (Some(y), Some(m)) => YearMonth.of(y, m)
    case _ => YearMonth.now()
  }

  @ApiOperation(value = "Hakee yhden kuukauden tapahtumat", httpMethod = "GET")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "categories", required = false, allowMultiple = true, dataType = "integer", paramType = "query", value = "Kategoriat joihin tulokset rajataan"),
    new ApiImplicitParam(name = "year", required = true, dataType = "integer", paramType = "query", value = "Vuosi"),
    new ApiImplicitParam(name = "month", required = true, dataType = "integer", paramType = "query", value = "Kuukausi")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Kuukauden tapahtumat päivittäin jaoteltuna", response = classOf[Timeline]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def getTimelineRoute: Route =
    path("timeline") {
      get {
        parameters("categories".as(CsvSeq[Long]).?, "year".as[Int].?, "month".as[Int].?) {
          (categories, year, month) => {
            withUser { user =>
              sendResponse(Future(releaseService.timeline(categories.getOrElse(Seq.empty), parseMonth(year, month), user)))
            }
          }
        }
      }
    }

  @ApiOperation(value = "Poistaa tapahtuman", httpMethod = "DELETE")
  @Path("{id}")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", required = true, dataType = "integer", paramType = "path", value = "Poistettavan tapahtuman id")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Poistettujen tapahtumien lukumäärä (käytännössä 0 tai 1)", response = classOf[Int]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def deleteEventRoute: Route =
    path("timeline" / IntNumber) { id =>
      delete {
        withUser { user =>
          sendResponse(Future(releaseService.deleteTimelineItem(id)))
        }
      }
    }

  val routes: Route = getTimelineRoute ~ deleteEventRoute
}
