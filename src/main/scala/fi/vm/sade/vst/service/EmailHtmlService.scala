package fi.vm.sade.vst.service

import fi.vm.sade.vst.Configuration
import fi.vm.sade.vst.model.Release
import org.joda.time.DateTime
import scala.util.Try
import scala.xml.{Elem, XML}

object EmailHtmlService extends Configuration {
  def htmlString(date: DateTime, releases: Iterable[Release], language: String) = {
    s"""<!DOCTYPE html>
        |${htmlBasicFrame(date, releases, language)}
     """.stripMargin
  }

  def htmlTitle(date: DateTime, language: String) = {
    <title>Koonti päivän tiedotteista {date.toString("dd.MM.yyyy")}</title>
  }

  def htmlHeader(date: DateTime, language: String) = {
    <div style="padding-left: 2em; padding-right: 2em;">
      <p class="release-title">{date.toString("dd.MM.yyyy")} julkaistut tiedotteet:</p>
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

  def htmlBasicFrame(date: DateTime, releases: Iterable[Release], language: String) = {
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        {htmlTitle(date, language)}
      </head>
      <body style="background: #F6F4F0; font-family: arial;">
        <div style="padding-left: 4em; padding-right: 4em;">
          {htmlHeader(date, language)}
          {releases.map(release => htmlReleaseBlock(release, language))}
          {htmlFooter(language)}
        </div>
      </body>
    </html>
  }

  private def mainReleaseContent(releaseContent: String): Either[String, Elem] = {
    Try(XML.loadString(releaseContent))
      .toOption
      .toRight(releaseContent)
  }
}
