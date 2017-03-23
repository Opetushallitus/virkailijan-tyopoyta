package fi.vm.sade.vst.actor.scheduler

import akka.actor.{ActorSystem, ActorRef}
import com.typesafe.akka.extension.quartz.QuartzSchedulerExtension
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.actor.scheduler.ProcedureRunnerActor.DailyEmailReleaseCheck
import fi.vm.sade.vst.service.EmailService

class QuartzScheduler(emailService: EmailService) extends Configuration {
  val system = ActorSystem("Virkailijan-Tyopoyta", config)
  val scheduler: QuartzSchedulerExtension = QuartzSchedulerExtension(system)
  val procedureRunnerActor: ActorRef = system.actorOf(ProcedureRunnerActor.props(emailService))

  def init(): Unit = {
    scheduler.schedule("AutomatedReleasesEmail", procedureRunnerActor, DailyEmailReleaseCheck)
  }
}
