package fi.vm.sade.vst.security

import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.javautils.nio.cas.{CasClient, CasConfig}
import fi.vm.sade.vst.Configuration
import org.asynchttpclient.{RequestBuilder, Response}

import java.util.concurrent.CompletableFuture
import scala.util.{Failure, Success, Try}


object RequestMethod extends Enumeration {
  val GET, POST = Value
}

class CasUtils(casClient: CasClient) extends LazyLogging with Configuration {

  def validateTicket(service: String, serviceTicket: String): Try[String] = {
    Try(casClient.validateServiceTicketWithVirkailijaUsernameBlocking(service, serviceTicket)).recoverWith({
      case t =>
        Failure(new IllegalArgumentException(s"Cas ticket $serviceTicket rejected : ${t.getMessage}", t))
    })
  }

  def serviceClient(service: String) = new CasServiceClient(service)

  class CasServiceClient(service: String) {
    private lazy val casClient = new CasClient(new CasConfig(
      config.getString("virkailijan-tyopoyta.cas.user"),
      config.getString("virkailijan-tyopoyta.cas.password"),
      config.getString("virkailijan-tyopoyta.cas.url"),
      service,
      csrf,
      callerId,
      "JSESSIONID",
      "/j_spring_cas_security_check",
      null
    ))

    private def handleResponse(responseFuture: CompletableFuture[Response]): Try[String] = {
      val response = responseFuture.get()
      //lazy val body = EntityDecoder.decodeString(response.getResponseBody).unsafePerformSync
      if (response.getStatusCode() == 200) {
        Success(response.getResponseBody())
      } else {
        Failure(new RuntimeException(response.getResponseBody()))
      }
    }

    def authenticatedJsonPost[A](url: String, json: String): Try[String] = {
      val body = Some(json)
      authenticatedRequest(url, "POST", mediaType = Some("application/json"), body = body)
    }

    def authenticatedRequest[A](url: String,
                                method: String,
                                mediaType: Option[String] = None,
                                body: Option[A] = None): Try[String] = {

//      val asyncHttpMethod = method match {
//        case RequestMethod.GET => "GET"
//        case RequestMethod.POST => "POST"
//      }

//      val urlOption = Some(url)
//
//      urlOption match {
//        case Some(u) =>
//          u
//        case None =>
//          logger.error(s"Failed parsing uri: $uri")
//          None
//      }
//      val requestOLD = new Request(method = asyncHttpMethod, uri = Uri.fromString(uri).toOption.get, headers = headers) //, body = requestBody)

      val request = body match {
        case Some(_) => new RequestBuilder()
          .setUrl(url)
          .setMethod(method)
          .addHeader("Accept", "application/json")
          .addHeader("Caller-Id", callerId)
          .setBody(body.get.toString)
          .build
        case None => new RequestBuilder()
          .setUrl(url)
          .setMethod(method)
          .addHeader("Caller-Id", callerId)
          .build
      }

//
//      val send = body.map({ body =>
//        val task = request.withBody(body)(encoder)
//        val taskWithMediaType = mediaType.map(mediaType => task.map(_.withType(mediaType))).getOrElse(task)
//        taskWithMediaType.flatMap(request => casClient.execute(request))
//      }).getOrElse {
//        val finalRequest = mediaType.map(request.withType).getOrElse(request)
//        casClient.execute(finalRequest)
//      }

      Try(casClient.execute(request)).flatMap(handleResponse)
    }
  }

}
