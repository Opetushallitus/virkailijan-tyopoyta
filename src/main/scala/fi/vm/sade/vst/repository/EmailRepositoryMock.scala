package fi.vm.sade.vst.repository

import fi.vm.sade.vst.model.EmailEvent
import java.util.concurrent.atomic.AtomicReference

class EmailRepositoryMock() extends EmailRepository {
  private val emailEventsTable = new AtomicReference(Iterable[EmailEvent]())

  def emailEvent(id: Long): Option[EmailEvent] = {
    emailEventsTable.get().find(_.id == id)
  }

  def existsForRelease(releaseId: Long): Boolean = {
    emailEventsTable.get().exists(_.releaseId == releaseId)
  }

  def addEvent(event: EmailEvent): Option[EmailEvent] = {
    val newEvent = event.copy(id = nextEventId)
    val mailEvents: Iterable[EmailEvent] = emailEventsTable.get()
    emailEventsTable.set(mailEvents ++ Iterable(newEvent))
    Option(newEvent)
  }

  def nextEventId: Long = {
    val events = emailEventsTable.get()
    if (events.isEmpty) 1
    else events.maxBy(_.id).id + 1
  }
}
