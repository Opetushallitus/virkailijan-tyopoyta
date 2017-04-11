package fi.vm.sade.vst.actor.scheduler

import akka.actor.{Actor, Props}
import fi.vm.sade.vst.security.KayttooikeusService
import ApplicationGroupsUpdateActor._

object ApplicationGroupsUpdateActor {
  def props(userAccessService: KayttooikeusService): Props = Props(new ApplicationGroupsUpdateActor(userAccessService))

  case object UpdateApplicationGroups
}

class ApplicationGroupsUpdateActor(userAccessService: KayttooikeusService) extends Actor {
  override def receive: Receive = {
    case UpdateApplicationGroups => updateApplicationGroups()
    case _ =>
  }

  private def updateApplicationGroups(): Unit = {
    userAccessService.updateApplicationGroups()
  }
}
