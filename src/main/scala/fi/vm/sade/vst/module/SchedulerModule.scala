package fi.vm.sade.vst.module

import fi.vm.sade.vst.actor.scheduler.QuartzScheduler

trait SchedulerModule extends AuthenticationModule with ServiceModule {
  import com.softwaremill.macwire._

  lazy val quartzScheduler: QuartzScheduler = wire[QuartzScheduler]
}
