package fi.vm.sade.vst.server.routes

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.{Directives, Route}
import fi.vm.sade.vst.model.{JsonSupport, TargetingGroup, UserProfile}
import fi.vm.sade.vst.security.UserService
import fi.vm.sade.vst.server.{ResponseUtils, SessionSupport}
import io.swagger.annotations._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Api(value = "Käyttäjätietoihin liittyvät rajapinnat", produces = "application/json")
@Path("")
class UserRoutes(val userService: UserService) extends Directives with SessionSupport with JsonSupport with ResponseUtils {

  @ApiOperation(value = "Hakee käyttäjäprofiilin", httpMethod = "GET")
  @Path("/user")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Kirjautuneen käyttäjän käyttäjäprofiili", response = classOf[UserProfile]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def userProfileRoute: Route =
    path("user") {
      get {
        withUser { user =>
          sendResponse(Future(userService.userProfile(user.userId)))
        }
      }
    }

  @ApiOperation(value = "Tallentaa käyttäjäprofiilin", httpMethod = "POST")
  @Path("/user")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "profile", required = true, dataType = "fi.vm.sade.vst.model.UserProfileUpdate", paramType = "body")
  ))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Tallennettu käyttäjäprofiili", response = classOf[UserProfile]),
    new ApiResponse(code = 400, message = "Käyttäjäprofiilin luku ei onnistunut"),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def setUserProfileRoute: Route =
    path("user") {
      post {
        entity(as[String]) { json =>
          withUser { user =>
            val updateProfile = parseUserProfileUpdate(json)
            updateProfile match {
              case Some(u) =>
                sendResponse(Future(userService.setUserProfile(user, u)))
              case None =>
                complete(StatusCodes.BadRequest)
            }
          }
        }
      }
    }

  @ApiOperation(value = "Tallentaa käyttäjän luonnoksen", httpMethod = "POST")
  @Path("/draft")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "draft", required = true, dataType = "string", paramType = "body", value = "JSON object")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Tallennettujen luonnosten määrä (1 tai 0)", response = classOf[Int]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def saveDraftRoute: Route =
    path("draft") {
      post {
        entity(as[String]) { json =>
          withAdminUser { user =>
            sendResponse(Future(userService.saveDraft(user, json)))
          }
        }
      }
    }

  @ApiOperation(value = "Poistaa käyttäjän luonnoksen", httpMethod = "DELETE")
  @Path("/draft")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Poistettujen luonnosten määrä (1 tai 0)", response = classOf[Int]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def deleteDraftRoute: Route =
    path("draft") {
      delete {
        withAdminUser { user =>
          sendResponse(Future(userService.deleteDraft(user)))
        }
      }
    }

  @ApiOperation(value = "Hakee tallennetut kohdennusvalinnat", httpMethod = "GET")
  @Path("/targetingGroups")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Käyttäjälle tallennetut kohdennusvalinnat", response = classOf[Array[TargetingGroup]]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def getTargetingGroupRoute: Route =
    path("targetingGroups") {
      get {
        withAdminUser { user =>
          sendResponse(Future(userService.targetingGroups(user)))
        }
      }
    }

  @ApiOperation(value = "Tallentaa kohdennusvalinnat", httpMethod = "POST")
  @Path("/targetingGroups")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(required = true, dataType = "fi.vm.sade.vst.model.TargetingGroupUpdate", paramType = "body")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Tallennetut kohdennusvalinnat", response = classOf[TargetingGroup]),
    new ApiResponse(code = 400, message = "Kohdennusvalintojen lukeminen ei onnistunut"),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def saveTargetingGroupRoute: Route =
    path("targetingGroups") {
      post {
        entity(as[String]) { json =>
          withAdminUser { user =>
            val targetingGroup = parseTargetingGroup(json)
            targetingGroup match {
              case Some(g) =>
                sendResponse(Future(userService.saveTargetingGroup(user, g.name, g.data)))
              case None =>
                complete(StatusCodes.BadRequest)
            }
          }
        }
      }
    }

  @ApiOperation(value = "Poistaa tallennetun kohdennuksen", httpMethod = "DELETE")
  @Path("/targetingGroups")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", required = true, dataType = "integer", paramType = "path", value = "Poistettavan julkaisun id")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Poistettujen kohdennusvalintojen lukumäärä (0 tai 1)", response = classOf[Int]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def deleteTargetingGroupRoute: Route =
    path("targetingGroups" / IntNumber) { id =>
      delete {
        withAdminUser { user =>
          sendResponse(Future(userService.deleteTargetingGroup(user, id)))
        }
      }
    }

  val routes: Route = userProfileRoute ~ setUserProfileRoute ~
    saveDraftRoute ~ deleteDraftRoute ~
    getTargetingGroupRoute ~ saveTargetingGroupRoute ~ deleteTargetingGroupRoute

}
