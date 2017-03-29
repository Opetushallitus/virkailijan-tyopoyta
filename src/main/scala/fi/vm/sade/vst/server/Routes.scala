package fi.vm.sade.vst.server

import java.time.YearMonth

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.ContentTypes._
import akka.http.scaladsl.model.{HttpEntity, HttpResponse, StatusCodes}
import akka.http.scaladsl.server.{Directives, Route}
import akka.http.scaladsl.unmarshalling.PredefinedFromStringUnmarshallers.CsvSeq
import com.softwaremill.session.SessionDirectives._
import com.softwaremill.session.SessionOptions._
import com.softwaremill.session._
import fi.vm.sade.vst.model.{JsonSupport, Release, User}
import fi.vm.sade.vst.repository.ReleaseRepository
import fi.vm.sade.vst.security.{UserService, KayttooikeusService}
import fi.vm.sade.vst.service.EmailService
import play.api.libs.json.{Json, Writes}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

class Routes(authenticationService: UserService,
             emailService: EmailService,
             kayttooikeusService: KayttooikeusService,
             releaseRepository: ReleaseRepository,
             userService: UserService)
  extends Directives
  with JsonSupport {

  val sessionConfig: SessionConfig = SessionConfig.default("some_very_long_secret_and_random_string_some_very_long_secret_and_random_string")
  implicit val sessionManager = new SessionManager[String](sessionConfig)


  def authenticateUser(ticket: String): Route = {
    userService.authenticate(ticket) match {
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
    if (release.notification.exists(_.sendEmail)) emailService.sendEmails(Vector(release), emailService.ImmediateEmail)
    release
  }

  val apiRoutes: Route = {
    requiredSession(oneOff, usingCookies) { uid =>
      get{
        path("release"){
          parameters("id".as[Long]) { id =>
            val release = Future(releaseRepository.release(id))
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
              (categories, tags, page) => sendResponse(Future(releaseRepository.notifications(categories, tags, page)))
            }
          } ~
          path(IntNumber) { id =>
            sendResponse(Future(releaseRepository.notification(id)))
          } ~
          path("unpublished") {
            sendResponse(Future(releaseRepository.unpublishedNotifications))
          }
        } ~
        path("categories"){
          userService.findUser(uid) match {
            case Success(u) => sendResponse(Future(releaseRepository.categories(u)))
            case Failure(e) => complete(StatusCodes.InternalServerError)
          }
        } ~
        path("timeline"){
          parameters("categories".as(CsvSeq[Long]).?, "year".as[Int].?, "month".as[Int].?) {
            (categories, year, month) => sendResponse(Future(releaseRepository.timeline(categories, parseMonth(year, month))))
          }
        } ~
        path("tags"){sendResponse(Future(releaseRepository.tags))} ~
        path("emailLogs"){sendResponse(Future(releaseRepository.emailLogs))} ~
        path("releasesForDate"){
          parameters("year".as[Int], "month".as[Int], "day".as[Int]) {
            (year, month, day) => {
              val date = java.time.LocalDate.of(year, month, day)
              val releases = releaseRepository.emailReleasesForDate(date)
              sendResponse(Future(releases))
            }
          }
        } ~
        path("emailhtml"){
          parameters("year".as[Int].?, "month".as[Int].?, "day".as[Int].?) {
            (year, month, day) => {
              sendHtml(Future {
                val date = (for {
                  y <- year
                  m <- month
                  d <- day
                } yield java.time.LocalDate.of(y, m, d)).getOrElse(java.time.LocalDate.now)
                val releases = releaseRepository.emailReleasesForDate(date)
                val previousDateReleases = releaseRepository.emailReleasesForDate(date.minusDays(1))
                emailService.sendEmails(releases ++ previousDateReleases, emailService.TimedEmail)
              })
            }
          }
        } ~
        path("generate"){
          parameters("amount" ? 1, "year".as[Int].?, "month".as[Int].?) {
            (amount, year, month) => {
              sendResponse(Future(releaseRepository.generateReleases(amount, parseMonth(year, month))))
            }
          }
        } ~
        path("user") {
          sendResponse(Future(userService.userProfile(uid)))
        } ~
        path("usergroups") {
          sendResponse(Future(userService.serviceUserGroups))
        }
      } ~
      put {
        path("release") {
          entity(as[String]) { json =>
            val release = parseReleaseUpdate(json)
            release match {
              case Some(r) => sendResponse(Future(releaseRepository.updateRelease(uid, r).map(sendInstantEmails)))
              case None => complete(StatusCodes.BadRequest)
            }
          }
        }
      } ~
      post {
        path("release") {
          entity(as[String]) { json =>
            val release = parseReleaseUpdate(json)
            release match {
              case Some(r) => sendResponse(Future(releaseRepository.addRelease(uid, r).map(sendInstantEmails)))
              case None => complete(StatusCodes.BadRequest)
            }
          }
        } ~
          path("user") {

            extractRequest { request =>
              entity(as[String]) { json =>
                val updateProfile = parseUserProfileUpdate(json)
                val ticket = request.uri.query().get("ticket")
                ticket match {
                  case Some(t) => {
                    updateProfile match {
                      case Some(u) => sendResponse(Future(userService.setUserProfile(uid,u)))
                      case None => complete(StatusCodes.Unauthorized)
                    }
                  }
                  case None => complete(StatusCodes.Unauthorized)
                }
              }
            }
          }
      } ~
      delete {
        path("releases"){
          entity(as[String]) { id => sendResponse(Future(releaseRepository.deleteRelease(id.toLong))) }
        }
      }
    }
  }

  val routes: Route = {
    pathPrefix("virkailijan-tyopoyta") {
      get {
        path("login") {
          optionalSession(oneOff, usingCookies) {
            case Some(uid) => sendResponse(
              Future(userService.findUser(uid)).flatMap{
                case Success(u) => Future.successful(u)
                case Failure(e) => Future.failed(e)
              }
            )
            case None => redirect(userService.loginUrl, StatusCodes.Found)
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
        apiRoutes
      }
    }
  }
}
