package fi.vm.sade.vst.server.routes

import javax.ws.rs.Path

import scala.concurrent.duration.{DurationInt, FiniteDuration}
import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.ContentTypes.{`application/json`, `text/html(UTF-8)`}
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.{Directives, Route}
import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.vst.model.JsonSupport
import fi.vm.sade.vst.security.UserService
import fi.vm.sade.vst.server.{AuditSupport, ResponseUtils, SessionSupport}
import fi.vm.sade.vst.service.{EmailService, ReleaseService}
import io.swagger.annotations._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

@Api(value = "Sähköpostin lähetykseen liittyvät admin operaatiot", produces = "application/json")
@Path("")
class EmailRoutes(val userService: UserService, releaseService: ReleaseService, emailService: EmailService)
  extends Directives
    with SessionSupport
    with AuditSupport
    with JsonSupport
    with ResponseUtils
    with LazyLogging {

  val emailTimeout: FiniteDuration = 5.hours

  private def sendHtml[T](eventualResult: Future[T]): Route = {
    onComplete(eventualResult) {
      case Success(result) ⇒
        complete {
          HttpResponse(entity = HttpEntity(`text/html(UTF-8)`, result.toString))
        }
      case Failure(e) ⇒
        logger.error(s"Exception in route execution", e)
        complete(ToResponseMarshallable(s"Error: $e"))
    }
  }

  @ApiOperation(value = "Pakottaa koostesähköpostien lähetyksen annetulle päivämäärälle", httpMethod = "GET")
  @Path("/emailhtml")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "year", required = true, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "month", required = true, dataType = "integer", paramType = "query"),
    new ApiImplicitParam(name = "day", required = true, dataType = "integer", paramType = "query")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Käynnistettyjen lähetysjobien id:t", response = classOf[Array[String]]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole muokkausoikeuksia tai voimassa olevaa sessiota")))
  def emailHtmlRoute: Route =
    path("emailhtml") {
      get {
        parameters("year".as[Int].?, "month".as[Int].?, "day".as[Int].?) {
          (year, month, day) => {
            withAdminUser { user =>
              withAuditUser(user) { implicit au =>
                sendHtml(Future {
                  val date = (for {
                    y <- year
                    m <- month
                    d <- day
                  } yield java.time.LocalDate.of(y, m, d)).getOrElse(java.time.LocalDate.now)
                  emailService.sendEmailsForDate(date, Option.apply(user.userId))
                })
              }
            }
          }
        }
      }
    }


  @ApiOperation(value = "Pakottaa sähköpostin lähetyksen annettua id:tä vastaavalle julkaisulle", httpMethod = "GET")
  @Path("/email/{id}")
  @ApiImplicitParams(Array(
    new ApiImplicitParam(name = "id", required = true, dataType = "integer", paramType = "path")))
  @ApiResponses(Array(
    new ApiResponse(code = 200, message = "Käynnistettyjen lähetysjobien määrä", response = classOf[Array[String]]),
    new ApiResponse(code = 401, message = "Käyttäjällä ei ole muokkausoikeuksia tai voimassa olevaa sessiota")))
  def sendEmailRoute: Route =
    path("email" / IntNumber) { releaseId =>
      withRequestTimeout(emailTimeout, emailTimeoutHandler) {
        post {
          withAdminUser { user =>
            withAuditUser(user) { implicit au =>
              releaseService.getReleaseForUser(releaseId, user) match {
                case Some(r) =>
                  logger.info(s"send email immediately for release ${releaseId} for user ${user.userId}")
                  sendResponse(Future(emailService.sendEmails(Vector(r), emailService.ImmediateEmail, Option.apply(user.userId)).size))
                case None =>
                  logger.error(s"send email immediately failed because no release found for user ${user.userId}")
                  complete(StatusCodes.BadRequest)
              }
            }
          }
        }
      }
    }

  val emailTimeoutHandler: HttpRequest => HttpResponse = {
    request =>
      logger.error(s"email sending timeout: ${request.uri} took longer than ${emailTimeout}.")
      HttpResponse(
        status = StatusCodes.RequestTimeout,
        entity = HttpEntity.empty(`application/json`)
      )
  }

  val routes: Route = emailHtmlRoute ~ sendEmailRoute
}
