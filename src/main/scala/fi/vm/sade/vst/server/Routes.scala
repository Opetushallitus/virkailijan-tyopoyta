package fi.vm.sade.vst.server

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.ContentTypes._
import akka.http.scaladsl.model.{HttpEntity, HttpResponse, StatusCodes}
import akka.http.scaladsl.server.{Directives, Route}
import akka.http.scaladsl.unmarshalling.PredefinedFromStringUnmarshallers.CsvSeq
import com.softwaremill.session.SessionDirectives._
import com.softwaremill.session.SessionOptions._
import com.softwaremill.session._
import fi.vm.sade.vst.model.{JsonSupport, Release, ReleaseUpdate, User}
import fi.vm.sade.vst.repository.ReleaseRepository
import fi.vm.sade.vst.security.{KayttooikeusService, UserService}
import fi.vm.sade.vst.service.EmailService
import java.time.YearMonth

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}
import play.api.libs.json.{Json, Writes}

class Routes(authenticationService: UserService,
             emailService: EmailService,
             kayttooikeusService: KayttooikeusService,
             releaseRepository: ReleaseRepository,
             userService: UserService,
             sessionConfig: SessionConfig)
  extends Directives
  with JsonSupport {

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

  def sendInstantEmails(release: Release, releaseUpdate: ReleaseUpdate) = {
    if (releaseUpdate.notification.exists(_.sendEmail)) emailService.sendEmails(Vector(release), emailService.ImmediateEmail)
    release
  }

  val releaseRoutes: Route = requiredSession(oneOff, usingCookies) { uid =>
    pathPrefix("release"){
      get{
        path(IntNumber) { id =>
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
      post {
        pathEnd{
          entity(as[String]) { json =>
            val release = parseReleaseUpdate(json)
            val user = userService.findUser(uid)
            (release, user.toOption) match {
              case (Some(releaseUpdate: ReleaseUpdate), Some(user: User)) =>
                sendResponse(Future(releaseRepository.addRelease(user, releaseUpdate).map(release => sendInstantEmails(release, releaseUpdate))))
              case (None, _) => complete(StatusCodes.BadRequest)
              case (_, None) => complete(StatusCodes.Unauthorized)
            }
          }
        }
      } ~
      put {
        pathEnd{
          entity(as[String]) { json =>
            val release = parseReleaseUpdate(json)
            val user = userService.findUser(uid)
            (release, user.toOption) match {
              case (Some(releaseUpdate: ReleaseUpdate), Some(user: User)) =>
                sendResponse(Future(releaseRepository.updateRelease(user, releaseUpdate).map(release => sendInstantEmails(release, releaseUpdate))))
              case (None, _) => complete(StatusCodes.BadRequest)
              case (_, None) => complete(StatusCodes.Unauthorized)
            }
          }
        }
      }
    }
  }

  val notificationRoutes: Route = {
    requiredSession(oneOff, usingCookies) { uid =>
      pathPrefix("notifications"){
        get{
          pathEnd {
            parameter("categories".as(CsvSeq[Long]).?, "tags".as(CsvSeq[Long]).?, "page".as[Int].?(1)) {
              userService.findUser(uid) match {
                case Success(u) => (categories, tags, page) => sendResponse(Future(releaseRepository.notifications(categories, tags, page, u)))
                case Failure(_) => (categories, tags, page) => complete(StatusCodes.Unauthorized)
              }
            }
          } ~
          path(IntNumber) { id =>
            userService.findUser(uid) match {
              case Success(u) => sendResponse(Future(releaseRepository.notification(id, u)))
              case Failure(_) => complete(StatusCodes.Unauthorized)
            }
          } ~
          path("unpublished") {
            userService.findUser(uid) match {
              case Success(u) => sendResponse(Future(releaseRepository.unpublishedNotifications(u)))
              case Failure(_) => complete(StatusCodes.Unauthorized)
            }

          }
        } ~
        delete{
          path(IntNumber){ id => sendResponse(Future(releaseRepository.deleteNotification(id)))}
        }
      }
    }
  }

  val timelineRoutes: Route = requiredSession(oneOff, usingCookies) { uid =>
    pathPrefix("timeline"){
      get{
        pathEnd {
          parameters("categories".as(CsvSeq[Long]).?, "year".as[Int].?, "month".as[Int].?) {
            userService.findUser(uid) match {
              case Success(u) => (categories, year, month) => sendResponse(Future(releaseRepository.timeline(categories, parseMonth(year, month), u)))
              case Failure(_) => (categories, year, month) => complete(StatusCodes.Unauthorized)
            }

          }
        }
      } ~
      delete {
        path(IntNumber){ id => sendResponse(Future(releaseRepository.deleteTimelineItem(id)))}
      }
    }
  }

  val userRoutes: Route = requiredSession(oneOff, usingCookies) { uid =>
    pathPrefix("user"){
      get{
        pathEnd{
          sendResponse(Future(userService.userProfile(uid)))
        }
      } ~
      post{
        pathEnd{
          entity(as[String]) { json =>
            val updateProfile = parseUserProfileUpdate(json)
            val user = userService.findUser(uid)
            updateProfile match {
              case Some(u) => sendResponse(Future(user.map(user => userService.setUserProfile(user,u)).toOption))
              case None => complete(StatusCodes.Unauthorized)
            }
          }
        } ~
        path("draft") {
          entity(as[String]) { json =>
            userService.findUser(uid) match {
              case Success(u) => onComplete(Future(userService.saveDraft(u, json))){
                case Success(_) => complete(StatusCodes.OK)
                case Failure(_) => complete(StatusCodes.InternalServerError)
              }
              case Failure(e) => complete(StatusCodes.InternalServerError)
            }
          }
        }
      }
    }
  }

  val serviceRoutes: Route = requiredSession(oneOff, usingCookies) {uid =>
    get{
      path("categories"){
        userService.findUser(uid) match {
          case Success(u) => sendResponse(Future(releaseRepository.categories(u)))
          case Failure(e) => complete(StatusCodes.InternalServerError)
        }
      } ~
      path("tags") {
        userService.findUser(uid) match {
          case Success(u) => sendResponse(Future(releaseRepository.tags(u)))
          case Failure(e) => complete(StatusCodes.InternalServerError)
        }
      } ~
      path("usergroups"){sendResponse(Future(userService.serviceUserGroups))}
    }
  }

  val emailRoutes: Route = requiredSession(oneOff, usingCookies) {uid =>
    get {
      path("emailLogs") {
        sendResponse(Future(releaseRepository.emailLogs))
      } ~
        path("releasesForDate") {
          parameters("year".as[Int], "month".as[Int], "day".as[Int]) {
            (year, month, day) => {
              val date = java.time.LocalDate.of(year, month, day)
              val releases = releaseRepository.emailReleasesForDate(date)
              sendResponse(Future(releases))
            }
          }
        } ~
        path("emailhtml") {
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
        }
    }
  }

//  val devRoutes: Route = {
//    path("generate"){
//      parameters("amount" ? 1, "year".as[Int].?, "month".as[Int].?) {
//        (amount, year, month) => {
//          sendResponse(Future(releaseRepository.generateReleases(amount, parseMonth(year, month))))
//        }
//      }
//    }
//  }

  val apiRoutes: Route = releaseRoutes ~ notificationRoutes ~ timelineRoutes ~ userRoutes ~ serviceRoutes ~ emailRoutes

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
