package fi.vm.sade.vst.server

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.ContentTypes._
import akka.http.scaladsl.model.{HttpEntity, HttpResponse, StatusCodes}
import akka.http.scaladsl.server.{Directives, Route}
import akka.http.scaladsl.unmarshalling.PredefinedFromStringUnmarshallers.CsvSeq
import com.softwaremill.session._
import com.softwaremill.session.SessionDirectives._
import com.softwaremill.session.SessionOptions._
import fi.vm.sade.vst.model.{Release, JsonSupport}
import fi.vm.sade.vst.repository.ReleaseRepository
import fi.vm.sade.vst.security.AuthenticationService
import fi.vm.sade.vst.service.EmailService
import java.time.YearMonth
import play.api.libs.json.{Json, Writes}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

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
        println(s"Exception in route execution")
        println(s"${e.getLocalizedMessage}")
        println(e)
        complete(StatusCodes.InternalServerError, e.getMessage)
    }
  }

  private def parseMonth(year: Option[Int], month: Option[Int]) = (year, month) match {
    case (Some(y), Some(m)) => YearMonth.of(y, m)
    case _ => YearMonth.now()
  }

  def sendHtml[T](eventualResult: Future[T]): Route = {
    onComplete(eventualResult) {
      case Success(result) ⇒
        complete{
          HttpResponse(entity = HttpEntity(`text/html(UTF-8)`, result.toString))
        }
      case Failure(e) ⇒
        println(s"Exception in route execution")
        println(s"${e.getLocalizedMessage}")
        println(e)
        complete(ToResponseMarshallable(s"Error: $e"))
    }
  }

  def sendInstantEmails(release: Release) = {
    // Release.sendEmail seems to have been removed and no replacement is given, rethink this part
    if (true) EmailService.sendEmails(Vector(release), EmailService.ImmediateEmail)
    release
  }

  val apiRoutes: Route = {
    get{
      path("release"){
        parameters("id".as[Long]) { id =>
          val release = releaseRepository.release(id)
          onComplete(release) {
            case Success(result) ⇒
              result match {
                case Some(r) => sendResponse(release)
                case None => complete(StatusCodes.NoContent)
              }
            case Failure(e) ⇒
              complete(StatusCodes.InternalServerError, e.getMessage)
          }
        }
      } ~
      pathPrefix("notifications"){
        pathEnd {
          parameter("categories".as(CsvSeq[Long]).?, "tags".as(CsvSeq[Long]).?, "page".as[Int].?(1)) {
            (categories, tags, page) => sendResponse(releaseRepository.notifications(categories, tags, page))
          }
        } ~
        path("unpublished") {
          sendResponse(releaseRepository.unpublishedNotifications())
        }
      } ~
      path("categories"){sendResponse(releaseRepository.categories)} ~
      path("timeline"){
        parameters("categories".as(CsvSeq[Long]).?, "year".as[Int].?, "month".as[Int].?) {
          (categories, year, month) => sendResponse(releaseRepository.timeline(categories, parseMonth(year, month)))
        }
      } ~
      path("tags"){sendResponse(releaseRepository.tags)} ~
      path("emailhtml"){sendHtml(releaseRepository.releases.map(releases => EmailService.sendEmails(releases, EmailService.TimedEmail)))} ~
      path("generate"){
        parameters("amount" ? 1, "year".as[Int].?, "month".as[Int].?) {
          (amount, year, month) => sendResponse(releaseRepository.generateReleases(amount, parseMonth(year, month)))
        }
      }

    } ~
    post {
      path("release") {
        entity(as[String]) { json =>
          val release = parseReleaseUpdate(json)
          release match {
            case Some(r) => sendResponse(releaseRepository.addRelease(r).map(sendInstantEmails))
            case None => complete(StatusCodes.BadRequest)
          }
        }
      }
    } ~
    delete {
      path("releases"){
        entity(as[String]) { id => sendResponse(releaseRepository.deleteRelease(id.toLong)) }
      }
    }
  }

  val routes: Route = {
    pathPrefix("virkailijan-tyopoyta") {
      get {
        path("login") {
          optionalSession(oneOff, usingCookies) {
            case Some(uid) => complete(serialize(uid))
            case None => redirect(authenticationService.loginUrl, StatusCodes.Found)
          }
        } ~
        path("authenticate") {
          extractRequest{ request =>
            val ticket = request.uri.query().get("ticket")
            ticket match {
              case Some(t) => authenticateUser(t)
              case None => complete(StatusCodes.Unauthorized)
            }
          }
        } ~
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
