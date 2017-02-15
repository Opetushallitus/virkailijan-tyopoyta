package fi.vm.sade.vst.service

import fi.vm.sade.groupemailer.{EmailData, EmailMessage, EmailRecipient, GroupEmail, GroupEmailComponent, GroupEmailService}
import fi.vm.sade.vst.model.Release
import fi.vm.sade.vst.repository.RepositoryModule
import org.joda.time.DateTime

object EmailService extends RepositoryModule with GroupEmailComponent {
  val groupEmailService: GroupEmailService = new TempEmailService

  def sendEmails(releases: Iterable[Release]) = {
    val emailsToReleases = releases.filterNot(releaseEventExists).flatMap { release =>
      val emails = emailsForUserGroup(userGroupsForRelease(release))
      emails.map(_ -> release)
    }
    val emailsToReleasesMap = emailsToReleases.groupBy(_._1).mapValues(_.map(_._2))
    val result = emailsToReleasesMap.map {
      case (emailAddress, releases) =>
        val recipients = List(formRecipient(emailAddress))
        val email = formEmail(releases)
        groupEmailService.sendMailWithoutTemplate(EmailData(email, recipients))
    }

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

  def releaseEventExists(release: Release): Boolean = false
  def userGroupsForRelease(release: Release): Any = Unit
  def emailsForUserGroup(userGroup: Any): Vector[String] = Vector("john.doe@email.com", "jane.doe@email.com")
}

class TempEmailService extends GroupEmailService {
  private var lastEmailSize = 0
  def getLastEmailSize = lastEmailSize
  override def send(email: GroupEmail): Option[String] = {
    println(s"send GroupEmail: $email")
    lastEmailSize = email.recipient.size
    Some("Thank you for using fake group email service")
  }

  override def sendMailWithoutTemplate(htmlEmail: EmailData) = {
    println(s"sendMailWithoutTemplate EmailData: $htmlEmail")
    Some(htmlEmail.email.body)
  }
}
