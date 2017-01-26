package fi.vm.sade.vst.server

import fi.vm.sade.vst.repository.RepositoryModule
import fi.vm.sade.vst.security.AuthenticationModule

trait ServerModule extends AuthenticationModule with RepositoryModule {

  import com.softwaremill.macwire._

  lazy val routes: Routes = wire[Routes]

}
