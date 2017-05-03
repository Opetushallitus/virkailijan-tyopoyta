package fi.vm.sade.vst.module

trait ServerModule
  extends MigrationModule
  with RepositoryModule
  with SchedulerModule
  with RoutesModule
