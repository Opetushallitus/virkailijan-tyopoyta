package fi.vm.sade.vst

import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.auditlog.virkailijantyopoyta.LogMessage.builder
import fi.vm.sade.auditlog.virkailijantyopoyta.VirkailijanTyopoytaOperation._
import fi.vm.sade.auditlog.{ApplicationType, Audit}
import fi.vm.sade.vst.model.User

trait Logging extends LazyLogging {

  private val audit = new Audit("virkailijan-tyopoyta", ApplicationType.VIRKAILIJA)

  object AuditLog {

    object AuditTarget extends Enumeration {
      type PaymentStatus = Value
      val release, notification, timeline = Value
    }

    object AuditOperation extends Enumeration {
      type PaymentStatus = Value
      val create, update, delete = Value
    }

    def auditCreateRelease(user: User, releaseId: Long): Unit = {
      val logMessage = builder()
        .virkailijaOid(user.userId)
        .releaseId(releaseId.toString)
        .setOperaatio(VIRKAILIJAN_TYOPOYTA_CREATE)
        .build()
      audit.log(logMessage)
    }

    def auditUpdateRelease(user: User, releaseId: Long): Unit = {
      val logMessage = builder()
        .virkailijaOid(user.userId)
        .notificationId(releaseId.toString)
        .setOperaatio(VIRKAILIJAN_TYOPOYTA_UPDATE)
        .build()
      audit.log(logMessage)
    }

    def auditDeleteRelease(user: User, releaseId: Long): Unit = {
      val logMessage = builder()
        .virkailijaOid(user.userId)
        .notificationId(releaseId.toString)
        .setOperaatio(VIRKAILIJAN_TYOPOYTA_DELETE)
        .build()
      audit.log(logMessage)
    }

    def auditCreateNotification(user: User, notificationId: Long): Unit = {
      val logMessage = builder()
        .virkailijaOid(user.userId)
        .notificationId(notificationId.toString)
        .setOperaatio(VIRKAILIJAN_TYOPOYTA_CREATE)
        .build()
      audit.log(logMessage)
    }

    def auditUpdateNotification(user: User, notificationId: Long): Unit = {
      val logMessage = builder()
        .virkailijaOid(user.userId)
        .notificationId(notificationId.toString)
        .setOperaatio(VIRKAILIJAN_TYOPOYTA_UPDATE)
        .build()
      audit.log(logMessage)
    }

    def auditDeleteNotification(user: User, notificationId: Long): Unit = {
      val logMessage = builder()
        .virkailijaOid(user.userId)
        .notificationId(notificationId.toString)
        .setOperaatio(VIRKAILIJAN_TYOPOYTA_DELETE)
        .build()
      audit.log(logMessage)
    }

    def auditCreateEvent(user: User, timelineItemId: Long): Unit = {
      val logMessage = builder()
        .virkailijaOid(user.userId)
        .eventId(timelineItemId.toString)
        .setOperaatio(VIRKAILIJAN_TYOPOYTA_CREATE)
        .build()
      audit.log(logMessage)
    }

    def auditUpdateEvent(user: User, timelineItemId: Long): Unit = {
      val logMessage = builder()
        .virkailijaOid(user.userId)
        .eventId(timelineItemId.toString)
        .setOperaatio(VIRKAILIJAN_TYOPOYTA_UPDATE)
        .build()
      audit.log(logMessage)
    }

    def auditDeleteEvent(user: User, timelineItemId: Long): Unit = {
      val logMessage = builder()
        .virkailijaOid(user.userId)
        .eventId(timelineItemId.toString)
        .setOperaatio(VIRKAILIJAN_TYOPOYTA_DELETE)
        .build()
      audit.log(logMessage)
    }

    def auditSendEmail(releaseId: Long, eventType: String): Unit = {
      val logMessage = builder()
        .releaseId(releaseId.toString)
        .setOperaatio(VIRKAILIJAN_TYOPOYTA_SEND_EMAIL)
        .build()
      audit.log(logMessage)
    }
  }

}
