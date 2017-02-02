package fi.vm.sade.vst.server

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.{ContentType, HttpEntity, HttpResponse, StatusCodes}
import akka.http.scaladsl.server.{Directives, Route}
import akka.http.scaladsl.model.MediaTypes.`application/json`
import com.softwaremill.session.SessionDirectives._
import com.softwaremill.session._
import com.softwaremill.session.SessionOptions._
import fi.vm.sade.vst.model.JsonSupport
import fi.vm.sade.vst.repository.{MockRepository, ReleaseRepository}
import fi.vm.sade.vst.security.{AuthenticationModule, AuthenticationService}
import play.api.libs.json.{Json, Writes}

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}


class Routes(authenticationService: AuthenticationService, releaseRepository: ReleaseRepository) extends Directives with JsonSupport {

  val sessionConfig: SessionConfig = SessionConfig.default("some_very_long_secret_and_random_string_some_very_long_secret_and_random_string")
  implicit val sessionManager = new SessionManager[String](sessionConfig)


  def authenticateUser(ticket: String): Route = {
    authenticationService.authenticate(ticket) match {
    case Some((uid, user)) =>
      setSession(oneOff, usingCookies, uid) {
        ctx => ctx.complete(serialize(user))
      }
    case None => complete(StatusCodes.Unauthorized)
  }}

  def sendResponse[T](eventualResult: Future[T])(implicit writes: Writes[T]): Route = {
    onComplete(eventualResult) {
      case Success(result) ⇒
        complete{
          HttpResponse(entity = HttpEntity(`application/json`, Json.toJson(result).toString()))
        }
      case Failure(e) ⇒
        complete(ToResponseMarshallable("Error"))
    }
  }

  val apiRoutes: Route = {
    get{
      path("releases"){sendResponse(releaseRepository.getReleases)} ~
      path("tags"){sendResponse(releaseRepository.getTags)}
      }
    } ~
    post{
      path("releases"){
        entity(as[String]){json =>
          val release = parseRelease(json)
          release match {
            case Some(r) => sendResponse(releaseRepository.addRelease(r))
            case None => complete(StatusCodes.BadRequest)
          }
        }
      }
  }

  val routes: Route = {
    pathPrefix("virkailijan-tyopoyta") {
      get {
        path("login") {
          optionalSession(oneOff, usingCookies) { session =>
            extractRequest { request =>
              val ticket = request.uri.query().get("ticket")
              (session, ticket) match {
                case (Some(u), _) => complete(serialize(u))
                case (_, Some(t: String)) => authenticateUser(t)
                case (None, None) => redirect(authenticationService.loginUrl, StatusCodes.Found)
              }
            }
          }} ~
          pathEndOrSingleSlash {
            getFromResource("ui/index.html")
          } ~
            encodeResponse {
              getFromResourceDirectory("ui")
            }
        } ~
        pathPrefix("api") {
          //Disabloidaan auth toistaiseksi kunnes saadaan testtua
//          requiredSession(oneOff, usingCookies) { session =>
            apiRoutes
//          }
      }
    }
  }
}
