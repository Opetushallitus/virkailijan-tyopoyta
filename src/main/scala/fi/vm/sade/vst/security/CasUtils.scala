package fi.vm.sade.vst.security

import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.javautils.nio.cas.CasConfig.CasConfigBuilder
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig, UserDetails}
import fi.vm.sade.vst.module.SharedHttpClient
import fi.vm.sade.vst.{AuthenticationConfig, Configuration}
import org.asynchttpclient.{Request, RequestBuilder}

import scala.collection.JavaConversions._
import scala.util.{Failure, Success, Try}

class CasUtils(ticketValidationClient: CasClient, config: AuthenticationConfig) extends LazyLogging with Configuration {
  private val validateTicketTask: String => UserDetails =
    ticketValidationClient.validateServiceTicketWithVirkailijaUserDetailsBlocking(config.serviceId + "/authenticate", _)

  def validateTicket(serviceTicket: String): Try[UserDetails] = {
    Try(validateTicketTask(serviceTicket))
      .map(mapRolesInUserDetails)
      .recoverWith({
        case t =>
          Failure(new IllegalArgumentException(s"Cas ticket $serviceTicket rejected : ${t.getMessage}", t))
      })
  }

  def serviceClient(service: String) = new CasServiceClient(service)

  private def mapRolesInUserDetails(details: UserDetails) =
    new UserDetails(
      details.getUser,
      details.getHenkiloOid,
      details.getKayttajaTyyppi,
      details.getIdpEntityId,
      details.getRoles.map(_.replace("ROLE_", "")))

  class CasServiceClient(service: String) {
    private lazy val casConfig: CasConfig =
      new CasConfigBuilder(
        config.casUsername,
        config.casPassword,
        urls.url("cas.url"),
        service,
        config.serviceId,
        config.serviceId,
        "/j_spring_cas_security_check"
      ).setJsessionName("JSESSIONID").build()

    private lazy val serviceClient = CasClientBuilder.buildFromConfigAndHttpClient(casConfig, SharedHttpClient.instance)

    def authenticatedJsonPost(url: String, json: String): Try[String] = {
      {
        val request = new RequestBuilder()
          .setMethod("POST")
          .setUrl(url)
          .setHeader("Content-Type", "application/json")
          .setBody(json)
          .build()
        authenticatedRequest(request)
      }
    }

    def authenticatedGet(uri: String): Try[String] = {
      val request = new RequestBuilder()
        .setMethod("GET")
        .setUrl(uri)
        .build()
      authenticatedRequest(request)
    }

    private def authenticatedRequest(request: Request): Try[String] =
      Try(serviceClient.execute(request).get()).flatMap {
        case r if r.getStatusCode == 200 =>
          Success(r.getResponseBody())
        case r =>
          val response = r.getResponseBody
          val url = request.getUrl
          val status = r.getStatusCode
          Failure(new RuntimeException(s"Call to $url failed with status $status and response $response"))
      }
  }
}
