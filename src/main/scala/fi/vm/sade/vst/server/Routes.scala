package fi.vm.sade.vst.server

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.ContentTypes._
import akka.http.scaladsl.model.{HttpEntity, HttpResponse, StatusCodes}
import akka.http.scaladsl.server.{AuthorizationFailedRejection, Directive1, Directives, Route}
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

  def withUser: Directive1[User] = requiredSession(oneOff, usingCookies).flatMap {
    uid =>
      userService.findUser(uid) match {
        case Success(user) => provide(user)
        case Failure(e) => complete(StatusCodes.Unauthorized)
      }
  }

  def withAdminUser: Directive1[User] = withUser.flatMap{
    case user if user.isAdmin => provide(user)
    case _ => complete(StatusCodes.Unauthorized)
  }

  val releaseRoutes: Route = {
    pathPrefix("release"){
      withAdminUser { user =>
        get{
          path(IntNumber) { id =>
            val release = Future(releaseRepository.release(id, user))
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
          pathEnd {
            entity(as[String]) { json =>
              val release = parseReleaseUpdate(json)
              release match {
                case Some(r: ReleaseUpdate) => sendResponse(Future(releaseRepository.addRelease(user, r).map(release => sendInstantEmails(release, r))))
                case None => complete(StatusCodes.BadRequest)
              }
            }
          }
        } ~
        put {
          pathEnd {
            entity(as[String]) { json =>
              val release = parseReleaseUpdate(json)
              release match {
                case Some(r: ReleaseUpdate) => sendResponse(Future(releaseRepository.updateRelease(user, r).map(release => sendInstantEmails(release, r))))
                case None => complete(StatusCodes.BadRequest)
              }
            }
          }
        }
      }
    }
  }

  val notificationRoutes: Route = {
      pathPrefix("notifications"){
        withUser { user =>
          get{
            pathEnd {
              parameter("categories".as(CsvSeq[Long]).?, "tags".as(CsvSeq[Long]).?, "page".as[Int].?(1)) {
                (categories, tags, page) => sendResponse(Future(
                  releaseRepository.notifications(categories.getOrElse(Seq.empty), tags.getOrElse(Seq.empty), page, user)))
              }
            } ~
            path(IntNumber) { id =>
              sendResponse(Future(releaseRepository.notification(id, user)))
            } ~
            path("special") {
              sendResponse(Future(releaseRepository.specialNotifications(user)))
            }
          }
        } ~
        withAdminUser { user =>
          get {
            path("unpublished") {
              sendResponse(Future(releaseRepository.unpublishedNotifications(user)))
            }
          } ~
          delete{
            path(IntNumber){ id => sendResponse(Future(releaseRepository.deleteNotification(id)))}
          }
        }
      }
  }

  val timelineRoutes: Route = {
    pathPrefix("timeline"){
      withUser {user =>
        get{
          pathEnd {
            parameters("categories".as(CsvSeq[Long]).?, "year".as[Int].?, "month".as[Int].?) {
              (categories, year, month) => sendResponse(Future(releaseRepository.timeline(categories, parseMonth(year, month), user)))
              }
            }
          }
        } ~
      withAdminUser {user =>
        delete {
          path(IntNumber){ id => sendResponse(Future(releaseRepository.deleteTimelineItem(id)))}
        }
      }
    }
  }

  val userRoutes: Route = withUser { user =>
    pathPrefix("user"){
      get{
        pathEnd{
          sendResponse(Future(userService.userProfile(user.userId)))
        }
      } ~
      post{
        pathEnd{
          entity(as[String]) { json =>
            val updateProfile = parseUserProfileUpdate(json)
            updateProfile match {
              case Some(u) => sendResponse(Future(userService.setUserProfile(user,u)))
              case None => complete(StatusCodes.BadRequest)
            }
          }
        } ~
        path("draft") {
          entity(as[String]) { json =>
            sendResponse(Future(userService.saveDraft(user, json)))
          }
        }
      } ~
      delete{
        path("draft"){sendResponse(Future(userService.deleteDraft(user)))}
    }}
  }

  val targetingGroupRoutes: Route = withUser { user =>
    pathPrefix("targetingGroups") {
      get{
        sendResponse(Future(userService.targetingGroups(user)))
      } ~
      post{
        entity(as[String]) { json =>
          val targetingGroup = parseTargetingGroup(json)
          targetingGroup match {
            case Some(g) => sendResponse(Future(userService.saveTargetingGroup(user, g.name, g.data)))
            case None => complete(StatusCodes.BadRequest)
          }
        }
      } ~
      delete{
        path(IntNumber){ id => sendResponse(Future(userService.deleteTargetingGroup(user, id)))}
      }
    }
  }

  val serviceRoutes: Route = withUser {user =>
    get{
      path("categories"){
        sendResponse(Future(releaseRepository.categories(user)))
      } ~
      path("tags") {
        sendResponse(Future(releaseRepository.tags(user)))
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

  val apiRoutes: Route = releaseRoutes ~ notificationRoutes ~ timelineRoutes ~ userRoutes ~ serviceRoutes ~ emailRoutes ~ targetingGroupRoutes

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
