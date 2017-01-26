package fi.vm.sade.vst.repository

trait RepositoryModule {

  import com.softwaremill.macwire._

  lazy val releaseRepository = wire[MockRepository]

}
