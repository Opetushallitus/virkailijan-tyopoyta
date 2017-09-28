package fi.vm.sade.vst.actor.scheduler

import java.net.InetAddress

import fi.vm.sade.auditlog.{User => AuditUser}
import akka.actor.{Actor, Props}
import fi.vm.sade.vst.service.EmailService
import java.time.LocalDate

import ProcedureRunnerActor._

object ProcedureRunnerActor {
  def props(emailService: EmailService): Props = Props(new ProcedureRunnerActor(emailService))

  case object DailyEmailReleaseCheck
}

class ProcedureRunnerActor(emailService: EmailService) extends Actor {
  override def receive: Receive = {
    case DailyEmailReleaseCheck => emailReleases()
    case _ =>
  }

  private def emailReleases(): Unit = {
    val date = LocalDate.now
    emailService.sendEmailsForDate(date)(procedureRunnerAuditUser)
  }

  val procedureRunnerAuditUser: AuditUser = {
    val oid = null
    val inetAddress: InetAddress = InetAddress.getLocalHost
    val session: String = null
    val userAgent: String = "procedure-runner-actor"
    new AuditUser(oid, inetAddress, session, userAgent)
  }
}
