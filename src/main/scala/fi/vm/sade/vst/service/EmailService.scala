package fi.vm.sade.vst.service

import fi.vm.sade.groupemailer._
import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model.{EmailEvent, Release}
import fi.vm.sade.vst.repository.RepositoryModule
import fi.vm.sade.vst.security.{KayttooikeusService, RequestMethod, CasUtils}
import java.time.LocalDate
import org.joda.time.DateTime
import scala.util.{Failure, Success, Try}

class EmailService(casUtils: CasUtils,
                   val accessService: KayttooikeusService)
  extends RepositoryModule
  with GroupEmailComponent
  with Configuration
  with JsonFormats {

  sealed trait EmailEventType { val description: String }
  case object ImmediateEmail extends EmailEventType { val description = "Immediately sent email" }
  case object TimedEmail extends EmailEventType { val description = "Normally timed email" }

  lazy val emailConfiguration = new GroupEmailerSettings(config)
  lazy val groupEmailService: GroupEmailService = new RemoteGroupEmailService(emailConfiguration, "virkailijan-tyopoyta-emailer")
//  lazy val groupEmailService: GroupEmailService = new FakeGroupEmailService
  private def casClient = casUtils.serviceClient(emailConfig.serviceAddress)

  private def parseEmailFromResponse(response: String): Seq[String] = {
    Try(scala.xml.XML.loadString(response)) match {
      case Success(s) =>
        val parsedXml = s \\ "henkiloEmail"
        parsedXml.map(_.text)
      case Failure(f) =>
        Seq.empty
    }
  }

  private def parseResponse(resp: Try[String]): Seq[String] = {
    resp match {
      case Success(s) =>
        parseEmailFromResponse(s)
      case Failure(f) =>
        Seq.empty
    }
  }

  def sendEmails(releases: Iterable[Release], eventType: EmailEventType): Iterable[String] = {
    val emailsToReleases = releases.flatMap { release =>
      val emails = emailsForUserGroup(userGroupsForRelease(release))
      emails.map(_ -> release)
    }
    val emailsToReleasesMap = emailsToReleases.groupBy(_._1).mapValues(_.map(_._2))
    val result = emailsToReleasesMap.flatMap {
      case (emailAddress, releases) =>
        val recipients = List(formRecipient(emailAddress))
        val email = formEmail(releases)
        groupEmailService.sendMailWithoutTemplate(EmailData(email, recipients))
    }

    addEmailEvents(releases.map(releaseToEmailEvent(_, eventType)))
    result
  }

  def sendEmailsForDate(date: LocalDate): Unit = {
    val releases = releaseRepository.emailReleasesForDate(date)
    sendEmails(releases, TimedEmail)
  }

  def formEmail(releases: Iterable[Release]): EmailMessage = {
    val date = DateTime.now
    val subject = s"Koonti päivän tiedotteista ${date.toString("dd.MM.yyyy")}"
    EmailMessage("virkailijan-tyopoyta", subject, EmailHtmlService.htmlString(date, releases, "fi"), html = true)
  }

  def formRecipient(email: String): EmailRecipient = {
    EmailRecipient(email)
  }

  def releaseEventExists(release: Release): Boolean = emailRepository.existsForRelease(release.id)

  def userGroupsForRelease(release: Release): Seq[String] = {
    val userGroups = releaseRepository.userGroupsForRelease(release.id).map(_.usergroupId)
    accessService.appGroups.filter(appGroup => userGroups.contains(appGroup.id)).map(_.name)
  }

  def emailsForUserGroup(userGroups: Seq[String]): Seq[String] = {
    val userGroupsValues = userGroups.map(group => s""""$group"""").mkString(",")
    val json = s"""{
                 |  "searchTerms": {
                 |	  "searchType": "EMAIL",
                 |		"targetGroups": [{
                 |		  "options": ["TUNNUKSENHALTIJAT"],
                 |			"type": "KOULUTA_KAYTTAJAT"
                 |		}],
                 |		"terms": [{
                 |		  "type": "koulutaRoolis",
                 |			"values": [$userGroupsValues]
                 |		}]
                 |	}
                 |}""".stripMargin
    val body = Option(json)
    val response = casClient.authenticatedRequest(s"${emailConfig.serviceAddress}/api/search/list.json?lang=fi", RequestMethod.POST, mediaType = Option(org.http4s.MediaType.`application/json`), body = body)
    parseResponse(response)
  }
  private def releaseToEmailEvent(release: Release, eventType: EmailEventType): EmailEvent = EmailEvent(0l, java.time.LocalDate.now(), release.id, eventType.description)
  private def addEmailEvents(emailEvents: Iterable[EmailEvent]): Iterable[EmailEvent] = emailEvents.flatMap(emailRepository.addEvent)
}
