package fi.vm.sade.vst.security

import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.utils.cas.CasClient.{ServiceTicket, Username}
import fi.vm.sade.utils.cas._
import fi.vm.sade.vst.{AuthenticationConfig, Configuration}
import org.http4s._
import scalaz.concurrent.Task

import scala.util.{Failure, Success, Try}


object RequestMethod extends Enumeration {
  val GET, POST = Value
}

class CasUtils(casClient: CasClient, config: AuthenticationConfig) extends LazyLogging with Configuration {
  private val validateTicketTask: (ServiceTicket) => Task[Username] = casClient.validateServiceTicketWithVirkailijaUsername(config.serviceId + "/authenticate")

  def validateTicket(serviceTicket: ServiceTicket): Try[Username] = {
    Try(validateTicketTask(serviceTicket).unsafePerformSync).recoverWith({
      case t =>
        Failure(new IllegalArgumentException(s"Cas ticket $serviceTicket rejected : ${t.getMessage}", t))
    })
  }

  def serviceClient(service: String) = new CasServiceClient(service)

  class CasServiceClient(service: String) {
    private lazy val casParams = CasParams(service, config.casUsername, config.casPassword)

    private lazy val authenticatingClient = new CasAuthenticatingClient(casClient,
      casParams, client.blaze.defaultClient, callerId, "JSESSIONID")

    private def handleResponse(maybeResponse: MaybeResponse): Try[String] = {
      val response = maybeResponse.orNotFound
      lazy val body = EntityDecoder.decodeString(response).unsafePerformSync
      if (response.status.isSuccess) {
        Success(body)
      } else {
        Failure(new RuntimeException(body))
      }
    }

    def authenticatedJsonPost[A](url: String, json: String): Try[String] = {
      val body = Some(json)
      authenticatedRequest(url, RequestMethod.POST, mediaType = Some(org.http4s.MediaType.`application/json`), body = body)
    }

    def authenticatedRequest[A](uri: String,
                                method: RequestMethod.Value,
                                headers: Headers = Headers.empty,
                                mediaType: Option[MediaType] = None,
                                body: Option[A] = None,
                                encoder: EntityEncoder[A] = EntityEncoder.stringEncoder): Try[String] = {

      val http4sMethod = method match {
        case RequestMethod.GET => Method.GET
        case RequestMethod.POST => Method.POST
      }

      val uriOption = Uri.fromString(uri).toOption

      uriOption match {
        case Some(u) =>
          u
        case None =>
          logger.error(s"Failed parsing uri: $uri")
          None
      }

      val request = Request(method = http4sMethod, uri = Uri.fromString(uri).toOption.get, headers = headers) //, body = requestBody)

      val send = body.map({ body =>
        val task = request.withBody(body)(encoder)
        val taskWithMediaType = mediaType.map(mediaType => task.map(_.withType(mediaType))).getOrElse(task)
        taskWithMediaType.flatMap(request => authenticatingClient.httpClient.toHttpService.run(request))
      }).getOrElse {
        val finalRequest = mediaType.map(request.withType).getOrElse(request)
        authenticatingClient.httpClient.toHttpService.run(finalRequest)
      }

      Try(send.unsafePerformSync).flatMap(handleResponse)
    }
  }

}
