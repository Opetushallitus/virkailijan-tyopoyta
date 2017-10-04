package fi.vm.sade.vst.logging

import com.typesafe.scalalogging.LazyLogging
import fi.vm.sade.auditlog.{ApplicationType, Audit, Changes, Operation, Target, User => AuditUser}
import fi.vm.sade.vst.model._
import play.api.libs.json.Json.toJson
import play.api.libs.json.{JsObject, JsValue}

trait AuditLogging extends JsonSupport {
  private val audit = AuditLogger.audit

  object AuditLog {
    object VirkailijanTyopoytaOperation extends Enumeration {
      type VirkailijanTyopoytaOperation = Value
      val VIRKAILIJAN_TYOPOYTA_CREATE, VIRKAILIJAN_TYOPOYTA_UPDATE, VIRKAILIJAN_TYOPOYTA_DELETE, VIRKAILIJAN_TYOPOYTA_SEND_EMAIL = Value
    }

    implicit def enumToOperation(value: VirkailijanTyopoytaOperation.Value): Operation = {
      new Operation {
        override def name(): String = value.toString
      }
    }

    import VirkailijanTyopoytaOperation._

    object AuditTarget extends Enumeration {
      type PaymentStatus = Value
      val release, notification, timeline, profile = Value
    }

    object AuditOperation extends Enumeration {
      type PaymentStatus = Value
      val create, update, delete = Value
    }

    def auditCreateRelease(user: User, releaseUpdate: ReleaseUpdate)(implicit au: AuditUser): Unit = {
      val changes = toNewChanges(toJson(releaseUpdate))
      val target: Target = new Target.Builder()
        .setField("type", AuditTarget.release.toString)
        .setField("id", releaseUpdate.id.toString)
        .build()
      val operation: Operation = VIRKAILIJAN_TYOPOYTA_CREATE

      audit.log(
        au,
        operation,
        target,
        changes)
    }

    def auditUpdateRelease(user: User, oldRelease: ReleaseUpdate, newRelease: ReleaseUpdate)(implicit au: AuditUser): Unit = {
      val changes = toDeltaChanges(toJson(oldRelease), toJson(newRelease))
      val target: Target = new Target.Builder()
        .setField("type", AuditTarget.release.toString)
        .setField("id", newRelease.id.toString)
        .build()
      val operation: Operation = VIRKAILIJAN_TYOPOYTA_UPDATE

      audit.log(
        au,
        operation,
        target,
        changes)
    }

    def auditDeleteRelease(user: User, releaseId: Long)(implicit au: AuditUser): Unit = {
      val changes: Changes = new Changes.Builder()
        .updated("deleted", "false", "true")
        .build()
      val target: Target = new Target.Builder()
        .setField("type", AuditTarget.release.toString)
        .setField("id", releaseId.toString)
        .build()
      val operation: Operation = VIRKAILIJAN_TYOPOYTA_DELETE

      audit.log(
        au,
        operation,
        target,
        changes)
    }

    def auditCreateNotification(user: User, notification: NotificationUpdate)(implicit au: AuditUser): Unit = {
      val changes = toNewChanges(toJson(notification))
      val target: Target = new Target.Builder()
        .setField("type", AuditTarget.notification.toString)
        .setField("id", notification.id.toString)
        .build()
      val operation: Operation = VIRKAILIJAN_TYOPOYTA_CREATE

      audit.log(
        au,
        operation,
        target,
        changes)
    }

    def auditUpdateNotification(user: User, oldNotification: NotificationUpdate, newNotification: NotificationUpdate)(implicit au: AuditUser): Unit = {
      val changes = toDeltaChanges(toJson(oldNotification), toJson(newNotification))
      val target: Target = new Target.Builder()
        .setField("type", AuditTarget.notification.toString)
        .setField("id", newNotification.id.toString)
        .build()

      val operation: Operation = VIRKAILIJAN_TYOPOYTA_UPDATE

      audit.log(
        au,
        operation,
        target,
        changes)
    }

    def auditDeleteNotification(user: User, notificationId: Long)(implicit au: AuditUser): Unit = {
      val changes: Changes = new Changes.Builder()
        .updated("deleted", "false", "true")
        .build()
      val target: Target = new Target.Builder()
        .setField("type", AuditTarget.notification.toString)
        .setField("id", notificationId.toString)
        .build()
      val operation: Operation = VIRKAILIJAN_TYOPOYTA_DELETE

      audit.log(
        au,
        operation,
        target,
        changes)
    }

    def auditCreateEvent(user: User, timelineItem: TimelineItem)(implicit au: AuditUser): Unit = {
      val changes = toNewChanges(toJson(timelineItem))
      val target: Target = new Target.Builder()
        .setField("type", AuditTarget.timeline.toString)
        .setField("id", timelineItem.id.toString)
        .build()
      val operation: Operation = VIRKAILIJAN_TYOPOYTA_CREATE

      audit.log(
        au,
        operation,
        target,
        changes)
    }

    def auditUpdateEvent(user: User, oldTimelineItem: TimelineItem, newTimelineItem: TimelineItem)(implicit au: AuditUser): Unit = {
      val changes = toDeltaChanges(toJson(oldTimelineItem), toJson(newTimelineItem))
      val target: Target = new Target.Builder()
        .setField("type", AuditTarget.timeline.toString)
        .setField("id", newTimelineItem.id.toString)
        .build()
      val operation: Operation = VIRKAILIJAN_TYOPOYTA_UPDATE

      audit.log(
        au,
        operation,
        target,
        changes)
    }

    def auditDeleteEvent(user: User, timelineItem: TimelineItem)(implicit au: AuditUser): Unit = {
      val changes = toDeletedChanges(toJson(timelineItem))
      val target: Target = new Target.Builder()
        .setField("type", AuditTarget.timeline.toString)
        .setField("id", timelineItem.id.toString)
        .build()
      val operation: Operation = VIRKAILIJAN_TYOPOYTA_DELETE

      audit.log(
        au,
        operation,
        target,
        changes)
    }

    def auditUpdateUserProfile(profileId: String, oldProfile: UserProfileUpdate, newProfile: UserProfileUpdate)(implicit au: AuditUser): Unit = {
      val changes = toDeltaChanges(toJson(oldProfile), toJson(newProfile))
      val target: Target = new Target.Builder()
        .setField("type", AuditTarget.profile.toString)
        .setField("id", profileId)
        .build()

      val operation: Operation = VIRKAILIJAN_TYOPOYTA_UPDATE

      audit.log(
        au,
        operation,
        target,
        changes)
    }

    def auditSendEmail(eventId: Long, event: EmailEvent)(implicit au: AuditUser): Unit = {
      val changes = toNewChanges(toJson(event))
      val operation: Operation = VIRKAILIJAN_TYOPOYTA_SEND_EMAIL
      val target: Target = new Target.Builder()
        .setField("type", AuditTarget.release.toString)
        .setField("releaseId", event.releaseId.toString)
        .setField("eventId", eventId.toString)
        .build()

      audit.log(
        au,
        operation,
        target,
        changes)
    }
  }

  def toNewChanges(json: JsValue): Changes = {
    val builder = new Changes.Builder()
    json.asInstanceOf[JsObject].fields.foreach{ case (k,v) =>
      builder.added(k, v.toString())
    }
    builder.build()
  }

  def toDeltaChanges(oldJson: JsValue, newJson: JsValue): Changes = {
    val builder = new Changes.Builder()
    val oldFields = oldJson.asInstanceOf[JsObject].fields
    val newFields = newJson.asInstanceOf[JsObject].fields
    oldFields.foreach{ case (k,v) =>
      newFields.find(_._1 == k) match {
        case Some(newField) =>
          val newValue = newField._2
          if (newValue != v) {
            builder.updated(k, v.toString(), newValue.toString())
          }
        case None =>
          builder.removed(k, v.toString())
      }
    }
    newFields.foreach{ case (k,v) =>
      if (!oldFields.exists(_._1 == k)) {
        builder.added(k, v.toString())
      }
    }
    builder.build()
  }

  def toDeletedChanges(json: JsValue): Changes = {
    val builder = new Changes.Builder()
    json.asInstanceOf[JsObject].fields.foreach{ case (k,v) =>
      builder.removed(k, v.toString())
    }
    builder.build()
  }
}

private[logging] object AuditLogger extends LazyLogging  {
  object LoggerImpl extends fi.vm.sade.auditlog.Logger {
    def log(var1: String): Unit = {
      logger.info(var1)
    }
  }

  val audit = new Audit(LoggerImpl, "virkailijan-tyopoyta", ApplicationType.VIRKAILIJA)
}
