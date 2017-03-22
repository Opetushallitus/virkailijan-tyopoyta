package fi.vm.sade.vst.actor.scheduler

import java.time.LocalDate

import akka.actor.{Actor, Props}
import ProcedureRunnerActor._
import fi.vm.sade.vst.service.EmailService

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
    emailService.sendEmailsForDate(date)
  }
}
