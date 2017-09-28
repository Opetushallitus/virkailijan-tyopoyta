package fi.vm.sade.vst.repository

import fi.vm.sade.auditlog.{User => AuditUser}
import fi.vm.sade.vst.model.EmailEvent

trait EmailRepository {
  def emailEvent(id: Long)(implicit au: AuditUser): Option[EmailEvent]
  def existsForRelease(releaseId: Long)(implicit au: AuditUser): Boolean
  def addEvent(event: EmailEvent)(implicit au: AuditUser): Option[EmailEvent]
}
