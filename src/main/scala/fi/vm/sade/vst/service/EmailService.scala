package fi.vm.sade.vst.service

import fi.vm.sade.groupemailer.{EmailData, EmailMessage, EmailRecipient, GroupEmail, GroupEmailComponent, GroupEmailService}
import fi.vm.sade.vst.model.{EmailEvent, Release}
import fi.vm.sade.vst.repository.RepositoryModule
import org.joda.time.DateTime

object EmailService extends RepositoryModule with GroupEmailComponent {
  sealed trait EmailEventType { val description: String }
  case object ImmediateEmail extends EmailEventType { val description = "Immediately sent email" }
  case object TimedEmail extends EmailEventType { val description = "Normally timed email" }

  val groupEmailService: GroupEmailService = new TempEmailService

  def sendEmails(releases: Iterable[Release], eventType: EmailEventType): Iterable[String] = {
    val filteredReleases = releases.filterNot(releaseEventExists)
    val emailsToReleases = filteredReleases.flatMap { release =>
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

    addEmailEvents(filteredReleases.map(releaseToEmailEvent(_, eventType)))
    result.foreach(r => println(s"Email result: $r"))
    result
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
  def userGroupsForRelease(release: Release): Any = Unit
  def emailsForUserGroup(userGroup: Any): Vector[String] = Vector("john.doe@email.com", "jane.doe@email.com")
  private def releaseToEmailEvent(release: Release, eventType: EmailEventType): EmailEvent = EmailEvent(0l, java.time.LocalDate.now(), release.id, eventType.description)
  private def addEmailEvents(emailEvents: Iterable[EmailEvent]): Iterable[EmailEvent] = emailEvents.flatMap(emailRepository.addEvent)
}

class TempEmailService extends GroupEmailService {
  private var lastEmailSize = 0
  def getLastEmailSize = lastEmailSize
  override def send(email: GroupEmail): Option[String] = {
    lastEmailSize = email.recipient.size
    Some("Thank you for using fake group email service")
  }

  override def sendMailWithoutTemplate(htmlEmail: EmailData) = {
    Some(htmlEmail.email.body)
  }
}
