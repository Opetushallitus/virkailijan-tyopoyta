package fi.vm.sade.vst.repository

import fi.vm.sade.vst.{DBConfig, Logging}
import fi.vm.sade.vst.model.EmailEvent
import scalikejdbc._
import Tables._

class DBEmailRepository(val config: DBConfig) extends EmailRepository with SessionInfo with Logging {
  private val email = EmailEventTable.syntax
  private val emailCol = EmailEventTable.column

  def emailEvent(id: Long): Option[EmailEvent] = {
    withSQL[EmailEvent] {
      select
        .from(EmailEventTable as email)
        .where.eq(email.id, id)
    }.map(EmailEventTable(email)).single.apply()
  }

  def existsForRelease(releaseId: Long): Boolean = {
    withSQL[EmailEvent] {
      select
        .from(EmailEventTable as email)
        .where.eq(email.releaseId, releaseId)
    }.map(EmailEventTable(email)).list.apply().nonEmpty
  }

  def addEvent(event: EmailEvent): Option[EmailEvent] = {
    val id = withSQL {
      insert.into(EmailEventTable).namedValues(
        emailCol.createdAt -> event.createdAt,
        emailCol.releaseId -> event.releaseId,
        emailCol.eventType -> event.eventType
      )
    }.updateAndReturnGeneratedKey.apply()
    AuditLog.auditSendEmail(event.releaseId, event.eventType)
    emailEvent(id)
  }
}
