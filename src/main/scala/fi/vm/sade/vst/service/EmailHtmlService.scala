package fi.vm.sade.vst.service

import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model.{Notification, Release}
import java.time.LocalDate
import scala.util.Try
import scala.xml.{Elem, XML}

object EmailHtmlService extends Configuration {
  implicit val localDateOrdering: Ordering[LocalDate] = Ordering.by(_.toEpochDay)

  // TODO: Email forming could be done using templates, it was just easier to make if using pure scala for now
  def htmlString(releases: Iterable[Release], language: String) = {
    s"""<!DOCTYPE html>
        |${htmlBasicFrame(releases, language)}
     """.stripMargin
  }

  def htmlTitle(notifications: Iterable[Notification], language: String) = {
    val dates = notifications.map(_.publishDate)
    val minDate = dates.min
    val maxDate = dates.max
    val formatter = java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")
    val subjectDateString =
      if (minDate == maxDate) s"${minDate.format(formatter)}"
      else s"väliltä ${minDate.format(formatter)} - ${maxDate.format(formatter)}"
    <title>Koonti päivän tiedotteista {subjectDateString}</title>
  }

  def htmlHeader(date: LocalDate, language: String) = {
    val formatter = java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")
    <div style="padding-left: 2em; padding-right: 2em;">
      <p class="release-title">{date.format(formatter)} julkaistut tiedotteet:</p>
    </div>
  }

  def htmlFooter(language: String) = {
    <div style="background: #FFFFFF; padding: 1em 2em 1em 2em;">
      <table style="width: 100%; height: 100%;">
        <tr>
          <td style="text-align: left">
            <a href={loginPage}>Kirjaudu virkailijan työpöydälle</a>
          </td>
          <td style="text-align: right">
            <img src={ophLogoUrl} alt="Opetushallitus"/>
          </td>
        </tr>
      </table>
    </div>
  }

  def htmlReleaseBlock(release: Release, language: String) = {
    val releaseContent = release.notification.flatMap(_.content.get(language))
    val title = releaseContent.map(_.title).getOrElse("No title")
    val mainContent = mainReleaseContent(releaseContent.map(_.text).getOrElse(""))

    <div style="padding-bottom: 2em;">
      <div style="background: #FFFFFF; padding: 1em 2em 1em 2em;">
        <h3>
          {title}
        </h3>
        {
          mainContent match {
            case Left(l) => l
            case Right(r) => r
          }
        }
      </div>
    </div>
  }

  def htmlBasicFrame(releases: Iterable[Release], language: String): Elem = {
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        {htmlTitle(releases.flatMap(_.notification), language)}
      </head>
      <body style="background: #F6F4F0; font-family: arial;">
        <div style="padding-left: 4em; padding-right: 4em;">
          {
            val releasesByDate = releases.groupBy(_.notification.map(_.publishDate))
            val notificationDatesDesc = releasesByDate.keys.flatten.toList.sortWith((date1, date2) => date1.compareTo(date2) >= 0)
            notificationDatesDesc.map { date => htmlContentPerDate(date, releasesByDate(Option(date)), language) }
          }
          {htmlFooter(language)}
        </div>
      </body>
    </html>
  }

  private def htmlContentPerDate(date: LocalDate, releases: Iterable[Release], language: String) = {
    val releasesByDateDesc = releases.toList.sortWith { (release1, release2) =>
      val compareResult = release1.notification.flatMap(notification =>
        release2.notification.map(notification2 => notification.publishDate.compareTo(notification2.publishDate))
      ).getOrElse(0)
      compareResult >= 0
    }

    <div>
      {htmlHeader(date, language)}
      {releasesByDateDesc.map(release => htmlReleaseBlock(release, language))}
    </div>
  }

  private def mainReleaseContent(releaseContent: String): Either[String, Elem] = {
    Try(XML.loadString(releaseContent))
      .toOption
      .toRight(releaseContent)
  }
}
