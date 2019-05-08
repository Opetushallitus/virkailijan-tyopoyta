package fi.vm.sade.vst.security

import fi.vm.sade.vst.AuthenticationConfig
import fi.vm.sade.vst.model.{JsonSupport, Kayttooikeusryhma}
import java.util.concurrent.atomic.AtomicReference

import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.properties.OphProperties
import fi.vm.sade.vst.repository.ReleaseRepository

import scala.collection.immutable.Seq
import scala.util.{Failure, Success, Try}

class KayttooikeusService(casUtils: CasUtils,
                          config: AuthenticationConfig,
                          releaseRepository: ReleaseRepository,
                          urls: OphProperties)
  extends JsonSupport
  with LazyLogging {
  private lazy val groups: AtomicReference[Seq[Kayttooikeusryhma]] = new AtomicReference[Seq[Kayttooikeusryhma]](sortedUserGroups)
  private val kayttooikeusClient = casUtils.serviceClient(urls.url("kayttooikeus-service.url"))

  def appGroups: Seq[Kayttooikeusryhma] = groups.get

  private def parseResponse(resp: Try[String], forUser: Boolean = false): Seq[Kayttooikeusryhma] = {
    resp match {
      case Success(s) =>
        parseKayttooikeusryhmat(s, forUser).getOrElse(List.empty)
      case Failure(t) =>
        val msg = "Failure parsing response from kayttooikeus-service"
        logger.error(msg, t)
        throw new RuntimeException(msg, t)
    }
  }

  private def getGroupsWithRole(role: String): Seq[Kayttooikeusryhma] = {
    val json = s"""{"VIRKAILIJANTYOPOYTA": "$role"}"""

    val url = urls.url("kayttooikeus-service.ryhmasByKayttooikeus")
    val resp: Try[String] = kayttooikeusClient.authenticatedJsonPost(url, json)

    parseResponse(resp)
  }

  private def getServiceGroups: Seq[Kayttooikeusryhma] = {
    val appCategories = releaseRepository.serviceCategories
    val roles = List("CRUD", "MUUT", "2ASTE", "KK", "PERUS", "VARDA")

    val roleMap: Map[String, Seq[Kayttooikeusryhma]] = roles.map(role => (s"APP_VIRKAILIJANTYOPOYTA_$role", getGroupsWithRole(role))).toMap
    val groups: Seq[Kayttooikeusryhma] = roleMap.values.flatten.toSet.toList

    groups.map(g => {
      val rolesForGroup = roleMap.filter(_._2.contains(g)).keys.toList
      g.copy(
        roles = rolesForGroup,
        categories = appCategories.filter(c => rolesForGroup.contains(c.role)).map(_.id)
      )
    })
  }

  def userGroupsForUser(oid: String, isAdmin: Boolean): Seq[Kayttooikeusryhma] = {
    if (isAdmin) {
      appGroups
    } else {
      val groupsResponse = kayttooikeusClient.authenticatedRequest(urls.url("kayttooikeus-service.userGroupsForUser", oid), RequestMethod.GET)

      val groupsForUser = parseResponse(groupsResponse, forUser = true)

      appGroups.filter(g => groupsForUser.map(_.id).contains(g.id))
    }
  }

  def sortedUserGroups: Seq[Kayttooikeusryhma] = {
    getServiceGroups.sortBy(_.id)
  }

  def updateApplicationGroups(): Unit = {
    groups.set(sortedUserGroups)
  }
}
