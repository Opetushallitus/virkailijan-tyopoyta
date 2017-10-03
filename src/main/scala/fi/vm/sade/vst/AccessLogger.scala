package fi.vm.sade.vst

import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

import akka.Done
import akka.stream.scaladsl.Sink
import com.typesafe.scalalogging.LazyLogging
import de.heikoseeberger.accessus.Accessus.AccessLog

import scala.concurrent.Future

class AccessLogger() extends LazyLogging {

  private val dft = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ")

  def apply(): AccessLog[Long, Future[Done]] =
    Sink.foreach {
      case ((req, t0), res) =>
        def getHeaderOpt(name: String) = req.headers.find(_.name() == name)
        def getHeader(name: String) = getHeaderOpt(name).map(_.value()).getOrElse("-")

        val timestamp = ZonedDateTime.now().format(dft)
        val responseCode = res.status.intValue()
        val request = s"${req.method.toString} ${req.uri.path} ${req.protocol.toString}"
        val responseTime: Long = (System.nanoTime() - t0) / 1000
        val method = req.method.value
        val environment = System.getProperty("env.name", "unknown")
        val userAgent: String = getHeader("User-Agent")
        val callerId: String = getHeader("Caller-Id")
        val xForwardedFor: String = getHeader("X-Forwarded-For")
        val remoteIp: String = getHeaderOpt("Remote-Address").orElse(getHeaderOpt("X-Real-Ip")).map(_.value()).getOrElse("-")
        val session: String = req.cookies.find(_.name == "JSESSIONID").map(_.value).getOrElse("-")
        val responseSize: String = res.entity.contentLengthOption.map(_.toString).getOrElse("-")
        val referer: String = getHeader("Referer")
        val opintopolkuApiKey: String = getHeader("Opintopolku-Api-Key")

        val message = s"""{
          "timestamp": ""$timestamp",
          "responseCode": "$responseCode",
          "request": "${request}",
          "responseTime": "$responseTime",
          "requestMethod": "$method",
          "service": "virkailijan-tyopoyta",
          "environment": "$environment",
          "customer": "OPH",
          "user-agent": "$userAgent",
          "caller-id": "$callerId",
          "x-forwarded-for": "$xForwardedFor",
          "remote-ip": "$remoteIp",
          "session": "$session",
          "response-size": "$responseSize",
          "referer": "$referer",
          "opintopolku-api-key": "$opintopolkuApiKey"
          }""".stripMargin('\n')

        logger.info(message)
    }
}