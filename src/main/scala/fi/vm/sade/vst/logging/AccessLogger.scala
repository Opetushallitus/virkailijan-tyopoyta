package fi.vm.sade.vst.logging

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

        val ts = ZonedDateTime.now().format(dft)
        val rc = res.status.intValue()
        val r = s"${req.method.value} ${req.uri.path} ${req.protocol.value}"
        val t: Long = (System.nanoTime() - t0) / (1e9.toLong)
        val m = req.method.value
        val env = System.getProperty("env.name", "unknown")
        val ua: String = getHeader("User-Agent")
        val ci: String = getHeader("Caller-Id")
        val xff: String = getHeader("X-Forwarded-For")
        val ip: String = getHeaderOpt("Remote-Address").orElse(getHeaderOpt("X-Real-Ip")).map(_.value()).getOrElse("-")
        val s: String = req.cookies.find(_.name == "JSESSIONID").map(_.value).getOrElse("-")
        val rs: String = res.entity.contentLengthOption.map(_.toString).getOrElse("-")
        val ref: String = getHeader("Referer")
        val ak: String = getHeader("Opintopolku-Api-Key")

        val message = s"""{"timestamp": ""$ts", "responseCode": "$rc", "request": "$r", "responseTime": "$t", "requestMethod": "$m", "service": "virkailijan-tyopoyta", "environment": "$env", "customer": "OPH", "user-agent": "$ua", "caller-id": "$ci", "x-forwarded-for": "$xff", "remote-ip": "$ip", "session": "$s", "response-size": "$rs", "referer": "$ref", "opintopolku-api-key": "$ak" }"""

        logger.info(message)
    }
}