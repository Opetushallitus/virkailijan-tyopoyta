package fi.vm.sade.vst.security

import fi.vm.sade.vst.AuthenticationConfig
import fi.vm.sade.vst.model.{JsonSupport, Kayttooikeus, Kayttooikeusryhma}

import scala.util.{Failure, Success, Try}

class KayttooikeusService(casUtils: CasUtils, config: AuthenticationConfig) extends JsonSupport{

  private val kayttooikeusClient = casUtils.serviceClient(config.kayttooikeusUri)

  lazy val appGroups: Seq[Kayttooikeusryhma] = fetchServiceUsergroups().sortBy(_.id)

  private def parseResponse(resp: Try[String], forUser: Boolean): Seq[Kayttooikeusryhma] = {
    resp match {
      case Success(s) => parseKayttooikeusryhmat(s, forUser).getOrElse(List.empty)
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

  private def filterUserGroups(groups: Seq[Kayttooikeusryhma]): Seq[Kayttooikeusryhma] =
    groups.filter(g => rightsForGroup(g).exists(r => r.palveluName == "VIRKAILIJANTYOPOYTA"))


  def fetchRightsForUser(oid: String): Seq[Kayttooikeusryhma] = {
    val groupsResponse = kayttooikeusClient.authenticatedRequest(s"${config.kayttooikeusUri}/kayttooikeusryhma/henkilo/$oid", RequestMethod.GET)

    val userRights = parseResponse(groupsResponse, forUser = true)

    appGroups.toSet.intersect(userRights.toSet).toList
  }

  def fetchServiceUsergroups(): Seq[Kayttooikeusryhma] = {
    val koResponse = kayttooikeusClient.authenticatedRequest(s"${config.kayttooikeusUri}/kayttooikeusryhma/", RequestMethod.GET)
    filterUserGroups(parseResponse(koResponse, forUser = false))
  }
}
