package fi.vm.sade.vst.server.routes

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.vst.model.{JsonSupport, Release, ReleaseUpdate}
import fi.vm.sade.vst.security.UserService
import fi.vm.sade.vst.server.{AuditSupport, ResponseUtils, SessionSupport}
import fi.vm.sade.vst.service.ReleaseService
import io.swagger.annotations._
import org.jsoup.Jsoup
import org.jsoup.safety.{Cleaner, Whitelist}

import scala.collection.mutable
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

@Api(value = "Julkaisuihin liittyvät rajapinnat", produces = "application/json")
@Path("/release")
class ReleaseRoutes(val userService: UserService, releaseService: ReleaseService)
  extends SessionSupport
    with AuditSupport
    with Directives
    with JsonSupport
    with ResponseUtils
    with LazyLogging {

  private val whitelist = Whitelist.basic()
    .addAttributes("a", "target", "rel")

  private def releaseValidationErrors(release: ReleaseUpdate): List[String] = {
    val cleaner = new Cleaner(whitelist)
    val invalidElements = new mutable.ArrayBuffer[String]()

    val notificationContent = release.notification.map(_.content.values.map(_.text)).getOrElse(Nil)
    val timelineContent = release.timeline.flatMap(_.content.values.map(_.text))
    val elements: Seq[String] = (notificationContent ++ timelineContent).toSeq

    val areAllValid: Boolean = elements.forall{ text =>
      val isValid = cleaner.isValid(Jsoup.parse(text))
      if (!isValid) {
        invalidElements += text
      }
      isValid
    }

    if (!areAllValid) {
      logger.error(s"Invalid html content in release: $invalidElements")
    }

    invalidElements.toList
  }


  @ApiOperation(value = "Hakee julkaisun annetulla id:llä", httpMethod = "GET")
  @Path("{id}")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", required = true, dataType = "integer", paramType = "path", value = "haettavan julkaisun id")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Id:tä vastaava julkaisu", response = classOf[Release]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole muokkausoikeuksia tai voimassa olevaa sessiota"),
    new ApiResponse(code = 404, message = "Annetulla id;llä ei löytynyt julkaisua")))
  def getReleaseRoute: Route =
    get {
      path("release" / IntNumber) { id =>
        withAdminUser { user =>
          sendOptionalResponse(Future(releaseService.getReleaseForUser(id, user)))
        }
      }
    }

  @ApiOperation(value = "Uuden julkaisun lisäys", notes = "Tallentaa uuden julkaisun ja poistaa luonnoksen", httpMethod = "POST")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(required = true, dataType = "fi.vm.sade.vst.model.ReleaseUpdate", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Luodun julkaisun id", response = classOf[Long]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole muokkausoikeuksia tai voimassa olevaa sessiota"),
    new ApiResponse(code = 400, message = "Julkaisun lukeminen epäonnistui")))
  def addReleaseRoute: Route =
    post {
      path("release") {
        entity(as[String]) { json =>
          withAdminUser { user =>
            withAuditUser(user) { implicit au =>
              parseReleaseUpdate(json) match {
                case Some(r: ReleaseUpdate) =>
                  releaseValidationErrors(r) match {
                    case Nil =>
                      sendResponse(Future(releaseService.addRelease(user, r).map(
                        added => {
                          userService.deleteDraft(user)
                          added.id
                        })))
                    case list =>
                      complete(StatusCodes.BadRequest, s"Following release elements were not valid HTML: $list")
                  }
                case None =>
                  complete(StatusCodes.BadRequest, "Could not parse release JSON")
              }
            }
          }
        }
      }
    }

  @ApiOperation(value = "Julkaisun päivitys", notes = "Päivittää julkaisun ja poistaa luonnoksen", httpMethod = "PUT")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(required = true, dataType = "fi.vm.sade.vst.model.ReleaseUpdate", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Muokatun julkaisun id", response = classOf[Long]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole muokkausoikeuksia tai voimassa olevaa sessiota"),
    new ApiResponse(code = 400, message = "Julkaisun lukeminen epäonnistui")))
  def editReleaseRoute: Route =
    put {
      path("release") {
        entity(as[String]) { json =>
          withAdminUser { user =>
            withAuditUser(user) { implicit au =>
              parseReleaseUpdate(json) match {
                case Some(r: ReleaseUpdate) =>
                  releaseValidationErrors(r) match {
                    case Nil =>
                      sendResponse(Future(releaseService.updateRelease(user, r).map(
                        edited => {
                          userService.deleteDraft(user)
                          edited.id
                        })))
                    case list =>
                      complete(StatusCodes.BadRequest, s"Following release elements were not valid HTML: $list")
                  }
                case None =>
                  complete(StatusCodes.BadRequest, "Could not parse release JSON")
              }
            }
          }
        }
      }
    }

  @ApiOperation(value = "Julkaisun poisto", notes = "", httpMethod = "DELETE")
  @Path("{id}")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", required = true, dataType = "integer", paramType = "path", value = "poistettavan julkaisun id")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Poistettujen julkaisujen lukumäärä (käytännössä 0 tai 1)", response = classOf[Int]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole muokkausoikeuksia tai voimassa olevaa sessiota"),
    new ApiResponse(code = 404, message = "Annetulla id;llä ei löytynyt julkaisua")))
  def deleteReleaseRoute: Route =
    delete {
      path("release" / IntNumber) { id =>
        withAdminUser { user =>
          withAuditUser(user) { implicit au =>
            val result = Future(releaseService.deleteRelease(user, id))
            onComplete(result) {
              case Success(_) ⇒
                sendResponse(result)
              case Failure(e) ⇒
                complete(StatusCodes.NotFound, e.getMessage)
            }
          }
        }
      }
    }

  val routes: Route = getReleaseRoute ~ addReleaseRoute ~ editReleaseRoute ~ deleteReleaseRoute
}
