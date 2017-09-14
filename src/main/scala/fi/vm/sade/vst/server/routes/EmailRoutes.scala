package fi.vm.sade.vst.server.routes

import javax.ws.rs.Path

import scala.concurrent.duration.DurationInt
import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.ContentTypes.{`text/html(UTF-8)`, `application/json`}
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.{Directives, Route}
import fi.vm.sade.vst.Logging
import fi.vm.sade.vst.model.JsonSupport
import fi.vm.sade.vst.security.UserService
import fi.vm.sade.vst.server.{ResponseUtils, SessionSupport}
import fi.vm.sade.vst.service.{EmailService, ReleaseService}
import io.swagger.annotations._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

@Api(value = "Sähköpostin lähetykseen liittyvät admin operaatiot", produces = "application/json")
@Path("")
class EmailRoutes(val userService: UserService, releaseService: ReleaseService, emailService: EmailService) extends Directives with SessionSupport with JsonSupport with ResponseUtils with Logging{

  private def sendHtml[T](eventualResult: Future[T]): Route = {
    onComplete(eventualResult) {
      case Success(result) ⇒
        complete{
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
      get{
        parameters("year".as[Int].?, "month".as[Int].?, "day".as[Int].?) {
          (year, month, day) => {
            withAdminUser { user =>
            sendHtml(Future {
              val date = (for {
                y <- year
                m <- month
                d <- day
              } yield java.time.LocalDate.of(y, m, d)).getOrElse(java.time.LocalDate.now)
              val releases = releaseService.emailReleasesForDate(date)
              val previousDateReleases = releaseService.emailReleasesForDate(date.minusDays(1))
              emailService.sendEmails(releases ++ previousDateReleases, emailService.TimedEmail)
            })
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
      withRequestTimeout(60.seconds, emailTimeoutHandler) {
        post{
          withAdminUser { user =>
            val release = releaseService.release(releaseId, user)
            release match{
              case Some(r) => sendResponse(Future(emailService.sendEmails(Vector(r), emailService.ImmediateEmail).size))
              case None => complete(StatusCodes.BadRequest)
            }
          }
        }
      }
  }

  val emailTimeoutHandler: HttpRequest => HttpResponse = {
    request => HttpResponse(
      status = StatusCodes.RequestTimeout,
      entity = HttpEntity.empty(`application/json`)
    )
  }

  val routes: Route =  emailHtmlRoute ~ sendEmailRoute
}
