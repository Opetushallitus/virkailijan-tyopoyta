package fi.vm.sade.vst.server.routes

import javax.ws.rs.Path

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Route
import fi.vm.sade.vst.model.{JsonSupport, TargetingGroup, UserProfile}
import fi.vm.sade.vst.security.UserService
import fi.vm.sade.vst.server.{AuditSupport, ResponseUtils, SessionSupport}
import io.swagger.annotations._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Api(value = "Käyttäjätietoihin liittyvät rajapinnat", produces = "application/json")
@Path("")
class UserRoutes(val userService: UserService) extends SessionSupport with AuditSupport with JsonSupport with ResponseUtils {

  @ApiOperation(value = "Hakee käyttäjäprofiilin", httpMethod = "GET")
  @Path("/user")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Kirjautuneen käyttäjän käyttäjäprofiili", response = classOf[UserProfile]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def userProfileRoute: Route =
    path("user") {
      get {
        withUserOrUnauthorized { user =>
          withAuditUser(user) { implicit au =>
            sendResponse(Future(userService.userProfile(user.userId)))
          }
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
          withUserOrUnauthorized { user =>
            withAuditUser(user) { implicit au =>
              parseUserProfileUpdate(json) match {
                case Some(u) =>
                  sendResponse(Future(userService.setUserProfile(user, u)))
                case None =>
                  logger.error(s"Could not parse user profile JSON: $json")
                  complete(StatusCodes.BadRequest, "Could not parse user profile JSON")
              }
            }
          }
        }
      }
    }

  @ApiOperation(value = "Hakee minkä tahansa käyttäjän profiilin", httpMethod = "GET")
  @Path("/user/{id}")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", required = true, dataType = "string", paramType = "path", value = "haettavan käyttäjän oid")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Annetun käyttäjän tiedot", response = classOf[UserProfile]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def otherUserProfileRoute: Route =
    path("user" / Segment) { otherUserOid: String =>
      get {
        withAdminUser { currentUser =>
          sendResponse(Future(userService.userProfile(otherUserOid)))
          }
        }
      }

  @ApiOperation(value = "Hakee käyttäjän tallennetut tiedot", httpMethod = "GET")
  @Path("/userDetails")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Kirjautuneen käyttäjän tiedot", response = classOf[UserProfile]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def userDetailsRoute: Route =
    path("userDetails") {
      get {
        withUserOrUnauthorized { user =>
          logger.debug(s"Responding with user details for ${user.userId}")
          sendResponse(Future(user))
        }
      }
    }

  @ApiOperation(value = "Hakee minkä tahansa käyttäjän tallennetut tiedot", httpMethod = "GET")
  @Path("/userDetails/{id}")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", required = true, dataType = "string", paramType = "path", value = "haettavan käyttäjän käyttäjänimi")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Annetun käyttäjän tiedot", response = classOf[UserProfile]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def otherUserDetailsRoute: Route =
    path("userDetails" / Segment) { otherUserId: String =>
      get {
        withAdminUser { currentUser =>
          userService.findUser(otherUserId).toOption match {
            case Some(user) =>
              logger.debug(s"Responding with user details on user ${otherUserId} for admin user ${currentUser.userId}")
              sendResponse(Future(user))
            case None =>
              logger.info(s"otherUserDetailsRoute failed: No user found for user id $otherUserId")
              complete(StatusCodes.Unauthorized, s"No user found for user id $otherUserId")
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
            parseTargetingGroup(json) match {
              case Some(g) =>
                sendResponse(Future(userService.saveTargetingGroup(user, g.name, g.data)))
              case None =>
                logger.error(s"Could not parse targeting groups JSON: $json")
                complete(StatusCodes.BadRequest, "Could not parse targeting groups JSON")
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

  val routes: Route =
      userProfileRoute ~
      setUserProfileRoute ~
      otherUserProfileRoute ~
      userDetailsRoute ~
      otherUserDetailsRoute ~
      saveDraftRoute ~
      deleteDraftRoute ~
      getTargetingGroupRoute ~
      saveTargetingGroupRoute ~
      deleteTargetingGroupRoute

}
