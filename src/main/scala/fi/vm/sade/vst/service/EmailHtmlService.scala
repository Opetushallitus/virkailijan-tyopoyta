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
    val contentHeader = EmailTranslations.translation(language).getOrElse(EmailTranslations.EmailHeader, EmailTranslations.defaultEmailHeader)
    val contentBetween = EmailTranslations.translation(language).getOrElse(EmailTranslations.EmailContentBetween, EmailTranslations.defaultEmailContentBetween)
    val dates = notifications.map(_.publishDate)
    val minDate = dates.min
    val maxDate = dates.max
    val formatter = java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")
    val subjectDateString =
      if (minDate == maxDate) s"${minDate.format(formatter)}"
      else s"$contentBetween ${minDate.format(formatter)} - ${maxDate.format(formatter)}"
    <title>{contentHeader} {subjectDateString}</title>
  }

  def htmlHeader(date: LocalDate, language: String) = {
    val contentReleases = EmailTranslations.translation(language).getOrElse(EmailTranslations.EmailContentReleases, EmailTranslations.defaultEmailContentReleases)
    val formatter = java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")
    <div style="padding-left: 2em; padding-right: 2em;">
      <p class="release-title">{date.format(formatter)} {contentReleases}:</p>
    </div>
  }

  def htmlFooter(language: String) = {
    val loginLink = EmailTranslations.translation(language).getOrElse(EmailTranslations.EmailFooterLink, EmailTranslations.defaultEmailFooterLink)
    <div style="background: #FFFFFF; padding: 1em 2em 1em 2em;">
      <table style="width: 100%; height: 100%;">
        <tr>
          <td style="text-align: left">
            <a href={loginPage}>{loginLink}</a>
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

private object EmailTranslations {
  /* Note, because emails don't contain a lot of text to be translated, this is currently the fastest way to start supporting
   * translations. Nothing is stopping from moving these to centralized translation service when the amount of needed
   * translations starts growing up.
   */
  trait TranslationKey
  case object EmailHeader extends TranslationKey
  case object EmailContentBetween extends TranslationKey
  case object EmailContentReleases extends TranslationKey
  case object EmailFooterLink extends TranslationKey

  val defaultEmailHeader = "Koonti päivän tiedotteista"
  val defaultEmailContentBetween = "väliltä"
  val defaultEmailContentReleases = "julkaistut tiedotteet"
  val defaultEmailFooterLink = "Kirjaudu virkailijan työpöydälle"

  private val finTranslationsMap: Map[TranslationKey, String] = Map(
    EmailHeader -> defaultEmailHeader,
    EmailContentBetween -> defaultEmailContentBetween,
    EmailContentReleases -> defaultEmailContentReleases,
    EmailFooterLink -> defaultEmailFooterLink
  )

  private val sweTranslationsMap: Map[TranslationKey, String] = Map(
    EmailHeader -> "Sammandrag av dagens meddelanden",
    EmailContentBetween -> "mellan",
    EmailContentReleases -> "publicerade meddelanden",
    EmailFooterLink -> "Logga in på administratörens arbetsbord"
  )

  private val translationMaps: Map[String, Map[TranslationKey, String]] = Map(
    "fi" -> finTranslationsMap,
    "swe" -> sweTranslationsMap,
    "sv" -> sweTranslationsMap
  )

  def translation(key: String): Map[TranslationKey, String] = translationMaps.getOrElse(key.toLowerCase, Map.empty)
}
