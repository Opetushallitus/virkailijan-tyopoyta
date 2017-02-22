package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model.EmailEvent

trait EmailRepository {
  def emailEvent(id: Long): Option[EmailEvent]
  def existsForRelease(releaseId: Long): Boolean
  def addEvent(event: EmailEvent): Option[EmailEvent]
}
