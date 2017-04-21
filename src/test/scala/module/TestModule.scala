package module

import fi.vm.sade.vst.module.{RepositoryModule, ServiceModule}

trait TestModule
  extends RepositoryModule
  with ServiceModule
