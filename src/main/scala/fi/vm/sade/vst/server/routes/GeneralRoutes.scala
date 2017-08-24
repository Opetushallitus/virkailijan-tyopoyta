package fi.vm.sade.vst.server.routes

import javax.ws.rs.Path

import akka.http.scaladsl.server.{Directives, Route}
import fi.vm.sade.vst.model.{Category, JsonSupport, Kayttooikeusryhma, TagGroup}
import fi.vm.sade.vst.security.UserService
import fi.vm.sade.vst.server.{ResponseUtils, SessionSupport}
import fi.vm.sade.vst.service.ReleaseService
import io.swagger.annotations.{Api, ApiOperation, ApiResponse, ApiResponses}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Api(value = "Yleiseien tietojen hakuun liittyvät rajapinnat", produces = "application/json")
@Path("")
class GeneralRoutes(val userService: UserService, releaseService: ReleaseService) extends Directives with SessionSupport with JsonSupport with ResponseUtils {

  @ApiOperation(value = "Hakee käyttäjälle näytettävät kategoriat", httpMethod = "GET")
  @Path("/categories")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Lista käyttäjälle näytettävistä kategorioista",  response = classOf[Array[Category]]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def categoriesRoute: Route = withUser { user =>
    path("categories"){
      get{
        sendResponse(Future(releaseService.categories(user)))
      }
    }
  }

  @ApiOperation(value = "Hakee avainsanat", httpMethod = "GET")
  @Path("/tags")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Lista avainsanoista ryhmittäin",  response = classOf[Array[TagGroup]]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def tagsRoute: Route = withUser { user =>
    path("tags"){
      get{
        sendResponse(Future(releaseService.tags(user)))
      }
    }
  }

  @ApiOperation(value = "Hakee käyttöoikeusryhmät", httpMethod = "GET")
  @Path("/usergroups")
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Lista sovelluksen kyättämistä käyttöoikeusryhmistä",  response = classOf[Array[Kayttooikeusryhma]]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole voimassa olevaa sessiota")))
  def userGroupsRoute: Route = withUser { user =>
    path("usergroups"){
      get{
        sendResponse(Future(userService.serviceUserGroups))
      }
    }
  }

  val routes: Route = categoriesRoute ~ tagsRoute ~ userGroupsRoute

}