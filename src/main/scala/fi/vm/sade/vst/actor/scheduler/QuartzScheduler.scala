package fi.vm.sade.vst.actor.scheduler

import akka.actor.{ActorSystem, ActorRef}
import com.typesafe.akka.extension.quartz.QuartzSchedulerExtension
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.actor.scheduler.ApplicationGroupsUpdateActor.UpdateApplicationGroups
import fi.vm.sade.vst.actor.scheduler.ProcedureRunnerActor.DailyEmailReleaseCheck
import fi.vm.sade.vst.security.KayttooikeusService
import fi.vm.sade.vst.service.EmailService

class QuartzScheduler(emailService: EmailService, userAccessService: KayttooikeusService) extends Configuration {
  val system = ActorSystem("Virkailijan-Tyopoyta", config)
  val scheduler: QuartzSchedulerExtension = QuartzSchedulerExtension(system)
  val procedureRunnerActor: ActorRef = system.actorOf(ProcedureRunnerActor.props(emailService))
  val applicationGroupsUpdaterActor: ActorRef = system.actorOf(ApplicationGroupsUpdateActor.props(userAccessService))

  def init(): Unit = {
    scheduler.schedule("AutomatedReleasesEmail", procedureRunnerActor, DailyEmailReleaseCheck)
    scheduler.schedule("ApplicationGroupsUpdate", applicationGroupsUpdaterActor, UpdateApplicationGroups)
  }
}
