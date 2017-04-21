package fi.vm.sade.vst.module

import fi.vm.sade.vst.server.Routes

trait RoutesModule
  extends AuthenticationModule
  with ServiceModule
  with RepositoryModule {
  import com.softwaremill.macwire._

  lazy val routes: Routes = wire[Routes]
}
