package fi.vm.sade.vst.security

import fi.vm.sade.utils.cas.CasClient.{ServiceTicket, Username}
import fi.vm.sade.utils.cas._
import fi.vm.sade.vst.AuthenticationConfig
import org.http4s._

import scala.util.{Failure, Success, Try}
import scalaz.concurrent.Task


object RequestMethod extends Enumeration {
  val GET, POST = Value
}

class CasUtils(casClient: CasClient, config: AuthenticationConfig) {

  private lazy val casUser = CasUser(config.casUsername, config.casPassword)

  private val validateTicketTask: (ServiceTicket) => Task[Username] = casClient.validateServiceTicket(config.serviceId+"/authenticate")

  def validateTicket(serviceTicket: ServiceTicket) : Try[Username] = {
    Try(validateTicketTask(serviceTicket).unsafePerformSync).recoverWith({
      case t => Failure(new IllegalArgumentException(s"Cas ticket $serviceTicket rejected", t))
    })
  }

  def serviceClient(service: String) = new CasServiceClient(service)

  class CasServiceClient(service: String) {

    private lazy val casParams = CasParams(service, config.casUsername, config.casPassword)

    private lazy val authenticatingClient = new CasAuthenticatingClient(casClient,
      casParams, client.blaze.defaultClient, "virkailijan-tyopoyta")

    private def handleResponse(response: Response): Try[String] = {
      val body = EntityDecoder.decodeString(response).unsafePerformSync

      if (response.status.isSuccess) {
        Success(body)
      } else {
        Failure(new RuntimeException(body))
      }
    }

    def authenticatedRequest[A](uri: String, method: RequestMethod.Value): Try[String] = {

      val http4sMethod = method match {
        case RequestMethod.GET => Method.GET
        case RequestMethod.POST => Method.POST
      }

      val req = Request(method = http4sMethod, uri = Uri.fromString(uri).toOption.get)

      val send = authenticatingClient.httpClient.toHttpService.run(req)

      val response = send.unsafePerformSync

      Try(send.unsafePerformSync).flatMap(handleResponse)
    }
  }

}
