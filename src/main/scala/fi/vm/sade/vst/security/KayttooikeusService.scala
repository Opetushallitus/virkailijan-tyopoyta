package fi.vm.sade.vst.security

import fi.vm.sade.vst.AuthenticationConfig
import fi.vm.sade.vst.model.{JsonSupport, Kayttooikeus, Kayttooikeusryhma}

import scala.util.{Failure, Success, Try}

class KayttooikeusService(casUtils: CasUtils, config: AuthenticationConfig) extends JsonSupport{

  lazy val appRights: Seq[Kayttooikeusryhma] = fetchServiceKayttooikeudet()

  private val kayttooikeusClient = casUtils.serviceClient(config.kayttooikeusUri)

  private def parseResponse(resp: Try[String]): Seq[Kayttooikeusryhma] = {
    resp match {
      case Success(s) => parseKayttooikeusryhmat(s).getOrElse(List.empty)
      case Failure(e) => List.empty
    }
  }

  private def rightsForGroup(group: Kayttooikeusryhma): Seq[Kayttooikeus] = {
    val rightsResponse = kayttooikeusClient.authenticatedRequest(s"${config.kayttooikeusUri}/kayttooikeusryhma/${group.id}/kayttooikeus", RequestMethod.GET)

    rightsResponse match {
      case Success(s) => parseKayttooikedet(s).getOrElse(List.empty)
      case Failure(e) => List.empty
    }
  }

  private def filterRightsGroups(groups: Seq[Kayttooikeusryhma]): Seq[Kayttooikeusryhma] =
    groups.filter(g => rightsForGroup(g).exists(r => r.palveluName == "VIRKAILIJANTYOPOYTA"))


  def fetchRightsForUser(oid: String): Seq[Kayttooikeusryhma] = {
    val groupsResponse = kayttooikeusClient.authenticatedRequest(s"${config.kayttooikeusUri}/kayttooikeusryhma/henkilo/$oid", RequestMethod.GET)

    parseResponse(groupsResponse)
  }

  def fetchServiceKayttooikeudet(): Seq[Kayttooikeusryhma] = {
    val koResponse = kayttooikeusClient.authenticatedRequest(s"${config.kayttooikeusUri}/kayttooikeusryhma/", RequestMethod.GET)
    parseResponse(koResponse)
  }
}
