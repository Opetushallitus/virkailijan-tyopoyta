package fi.vm.sade.vst.server.routes

import javax.ws.rs.Path

import akka.http.scaladsl.server.{Directives, Route}
import akka.http.scaladsl.unmarshalling.PredefinedFromStringUnmarshallers.CsvSeq
import fi.vm.sade.vst.Logging
import fi.vm.sade.vst.model.{JsonSupport, Notification, NotificationList}
import fi.vm.sade.vst.repository.ReleaseRepository
import fi.vm.sade.vst.security.UserService
import fi.vm.sade.vst.server.{ResponseUtils, SessionSupport}
import io.swagger.annotations._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Api(value = "Tiedotteisiin liittyvät rajapinnat.", produces = "application/json")
@Path("/notifications")
class NotificationRoutes(val userService: UserService, releaseRepository: ReleaseRepository)
  extends Directives with SessionSupport with JsonSupport with ResponseUtils with Logging{

  @ApiOperation(value = "Hakee tiedotteet", httpMethod = "GET", response = classOf[NotificationList])
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "categories", required = false, allowMultiple = true, dataType = "integer", paramType = "query", value = "Kategoriat joihin tulokset rajataan"),
    new ApiImplicitParam(name = "tags", required = false, allowMultiple = true, dataType = "integer", paramType = "query", value = "Tagit joihin tulokset rajataan"),
    new ApiImplicitParam(name = "page", required = false, dataType = "integer", paramType = "query", value = "Sivunumero")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Sivullinen kategorioita ja tageja vastaavia käyttäjälle kohdennettuja tiedotteita", response = classOf[NotificationList]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def getNotificationsRoute: Route = withUser { user =>
    path("notifications"){
      get{
        parameter("categories".as(CsvSeq[Long]).?, "tags".as(CsvSeq[Long]).?, "page".as[Int].?(1)) {
          (categories, tags, page) => sendResponse(Future(
            releaseRepository.notifications(categories.getOrElse(Seq.empty), tags.getOrElse(Seq.empty), page, user)))
        }
      }
    }
  }

  @ApiOperation(value = "Hakee tiedotteen annetulla id:llä", httpMethod = "GET")
  @Path("/{id}")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", required = true, dataType = "integer", paramType = "path", value = "Haettavan tiedotteen id")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Id:tä vastaava tiedote", response = classOf[Notification]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota"),
    new ApiResponse(code = 404, message = "Annetulla id:llä ei löytynyt tiedotetta")))
  def getNotificationRoute: Route = withUser { user =>
    path("notifications" / IntNumber){ id =>
      get{
        sendOptionalResponse(Future(releaseRepository.notification(id, user)))
      }
    }
  }

  @ApiOperation(value = "Hakee erikoistiedotteet", httpMethod = "GET", response = classOf[Array[Notification]])
  @Path("/special")
  @ApiResponses(Array(
    new ApiResponse(code=200, message = "Lista erikoistiedotteista, eli niistä, jotka sisältävät jotain erikoistageja, esim. häiriötiedotteet", response = classOf[Array[Notification]]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def getSpecialNotificationsRoute: Route = withUser { user =>
    path("notifications" / "special"){
      get{
        sendResponse(Future(releaseRepository.specialNotifications(user)))
      }
    }
  }

  @ApiOperation(value = "Hakee julkaisemattomat tiedotteet", httpMethod = "GET", response = classOf[Array[Notification]])
  @Path("/unpublished")
  @ApiResponses(Array(
    new ApiResponse(code=200, message = "Lista julkaisemattomista tiedotteista", response = classOf[Array[Notification]]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota tai muokkausoikeuksia")))
  def getUnpublishedNotificationsRoute: Route = withAdminUser { user =>
    path("notifications" / "unpublished"){
      get{
        sendResponse(Future(releaseRepository.unpublishedNotifications(user)))
      }
    }
  }

  @ApiOperation(value = "Poistaa tiedotteen", httpMethod = "DELETE")
  @Path("/{id}")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", required = true, dataType = "integer", paramType = "path", value = "Poistettavan tiedotteen id")
  ))
  @ApiResponses(Array(
    new ApiResponse(code=200, message = "Poistettujen tiedotteiden lukumäärä (käytännössä 0 tai 1)", response = classOf[Int]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota tai muokkausoikeuksia")))
  def deleteNotificationRoute = withAdminUser { user =>
    path("notifications" / IntNumber){ id =>
      delete{
        sendResponse(Future(releaseRepository.deleteNotification(user, id)))
      }
    }
  }

  val routes: Route = getNotificationsRoute ~ getNotificationRoute ~ getSpecialNotificationsRoute ~ getUnpublishedNotificationsRoute ~ deleteNotificationRoute
}
