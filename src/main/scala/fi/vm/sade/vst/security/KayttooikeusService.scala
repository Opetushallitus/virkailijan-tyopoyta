package fi.vm.sade.vst.security

import fi.vm.sade.vst.AuthenticationConfig
import fi.vm.sade.vst.model.{JsonSupport, Kayttooikeusryhma}
import scala.util.{Failure, Success, Try}

class KayttooikeusService(casUtils: CasUtils, config: AuthenticationConfig) extends JsonSupport{

  private val kayttooikeusClient = casUtils.serviceClient(config.kayttooikeusUri)

  lazy val appGroups: Seq[Kayttooikeusryhma] = fetchServiceUsergroups.sortBy(_.id)

  private def parseResponse(resp: Try[String], forUser: Boolean): Seq[Kayttooikeusryhma] = {
    resp match {
      case Success(s) => parseKayttooikeusryhmat(s, forUser).getOrElse(List.empty)
      case Failure(e) => List.empty
    }
  }

  private def rightsForGroup(group: Kayttooikeusryhma): Seq[String] = {
    val rightsResponse = kayttooikeusClient.authenticatedRequest(s"${config.kayttooikeusUri}/kayttooikeusryhma/${group.id}/kayttooikeus", RequestMethod.GET)

    val rights = rightsResponse match {
      case Success(s) => parseKayttooikedet(s).getOrElse(List.empty)
      case Failure(e) => List.empty
    }

    rights.filter(r => r.palveluName == "VIRKAILIJANTYOPOYTA").map(r => s"APP_${r.palveluName}_${r.role}")
  }

  private def filterUserGroups(groups: Seq[Kayttooikeusryhma]): Seq[Kayttooikeusryhma] =
    groups.map(g => g.copy(roles = rightsForGroup(g))).filter(_.roles.nonEmpty)

  def userGroupsForUser(oid: String, isAdmin: Boolean): Seq[Kayttooikeusryhma] = {

    if(isAdmin) appGroups else {
      val groupsResponse = kayttooikeusClient.authenticatedRequest(s"${config.kayttooikeusUri}/kayttooikeusryhma/henkilo/$oid", RequestMethod.GET)

      val userRights = parseResponse(groupsResponse, forUser = true)

      appGroups.toSet.intersect(userRights.toSet).toList
    }
  }

  def fetchServiceUsergroups: Seq[Kayttooikeusryhma] = {
    val koResponse = kayttooikeusClient.authenticatedRequest(s"${config.kayttooikeusUri}/kayttooikeusryhma/", RequestMethod.GET)
    filterUserGroups(parseResponse(koResponse, forUser = false))
  }
}
