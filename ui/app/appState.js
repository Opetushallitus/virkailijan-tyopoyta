import Bacon from 'baconjs'

import user from './state/user'
import categories from './state/categories'
import userGroups from './state/userGroups'
import tagGroups from './state/tagGroups'
import targetingGroups from './state/targetingGroups'
import view from './state/view'
import unpublishedNotifications from './state/notifications/unpublishedNotifications'
import specialNotifications from './state/notifications/specialNotifications'
import notifications from './state/notifications/notifications'
import timeline from './state/timeline'
import editor from './state/editor/editor'

import Dispatcher from './dispatcher'
import { initController } from './controller'

const dispatcher = new Dispatcher()

const events = {
  view: view.events,
  unpublishedNotifications: unpublishedNotifications.events,
  notifications: notifications.events,
  timeline: timeline.events,
  editor: editor.events
}

const initialState = {
  defaultLocale: 'fi',
  dateFormat: 'D.M.YYYY',
  translations: null,
  draftKey: 'virkailijanTyopoytaDraft',
  draft: null,
  user: user.initialState,
  userGroups: userGroups.initialState,
  categories: categories.initialState,
  tagGroups: tagGroups.initialState,
  targetingGroups: targetingGroups.initialState,
  view: view.initialState,
  unpublishedNotifications: unpublishedNotifications.initialState,
  specialNotifications: specialNotifications.initialState,
  notifications: notifications.initialState,
  timeline: timeline.initialState,
  editor: editor.initialState
}

const controller = initController(dispatcher, events)

export function getController () {
  return controller
}

// TODO: Combine buses?

export function setInitialState () {
  return Bacon.update(
    initialState,

    // User
    [user.fetchBus], user.onReceived,
    [user.fetchFailedBus], user.onFetchFailed,

    // Categories
    [categories.fetchBus], categories.onReceived,
    [categories.fetchFailedBus], categories.onFetchFailed,

    // User groups
    [userGroups.fetchBus], userGroups.onReceived,
    [userGroups.fetchFailedBus], userGroups.onFetchFailed,

    // Tags
    [tagGroups.fetchBus], tagGroups.onReceived,
    [tagGroups.fetchFailedBus], tagGroups.onFetchFailed,

    // Targeting groups
    [targetingGroups.fetchBus], targetingGroups.onReceived,
    [targetingGroups.fetchFailedBus], targetingGroups.onFetchFailed,
    [targetingGroups.saveBus], targetingGroups.onSaveComplete,
    [targetingGroups.removeBus], targetingGroups.onRemoveComplete,
    [targetingGroups.removeFailedBus], targetingGroups.onRemoveFailed,

    // View
    [view.alertsBus], view.onAlertsReceived,
    [dispatcher.stream(events.view.toggleTab)], view.toggleTab,
    [dispatcher.stream(events.view.removeAlert)], view.removeAlert,

    // Unpublished notifications
    [unpublishedNotifications.fetchBus], unpublishedNotifications.onReceived,
    [unpublishedNotifications.fetchFailedBus], unpublishedNotifications.onFetchFailed,
    [dispatcher.stream(events.unpublishedNotifications.open)], unpublishedNotifications.open,
    [dispatcher.stream(events.unpublishedNotifications.close)], unpublishedNotifications.close,
    [dispatcher.stream(events.unpublishedNotifications.edit)], unpublishedNotifications.edit,
    [dispatcher.stream(events.unpublishedNotifications.removeAlert)], unpublishedNotifications.removeAlert,

    // Special notifications
    [specialNotifications.fetchBus], specialNotifications.onReceived,
    [specialNotifications.fetchFailedBus], specialNotifications.onFetchFailed,

    // Notifications
    [notifications.fetchBus], notifications.onReceived,
    [notifications.fetchFailedBus], notifications.onFetchFailed,
    [notifications.removeNotificationBus], notifications.onNotificationRemoved,
    [notifications.saveCategoriesFailedBus], notifications.onSaveCategoriesFailed,
    [dispatcher.stream(events.notifications.toggleTag)], notifications.toggleTag,
    [dispatcher.stream(events.notifications.setSelectedTags)], notifications.setSelectedTags,
    [dispatcher.stream(events.notifications.toggleCategory)], notifications.toggleCategory,
    [dispatcher.stream(events.notifications.getPage)], notifications.getPage,
    [dispatcher.stream(events.notifications.edit)], notifications.edit,
    [dispatcher.stream(events.notifications.remove)], notifications.remove,
    [dispatcher.stream(events.notifications.confirmRemove)], notifications.confirmRemove,

    // Timeline
    [timeline.fetchBus], timeline.onReceived,
    [timeline.fetchFailedBus], timeline.onFetchFailed,
    [timeline.removeItemBus], timeline.onItemRemoved,
    [dispatcher.stream(events.timeline.getPreloadedMonth)], timeline.getPreloadedMonth,
    [dispatcher.stream(events.timeline.getNextMonth)], timeline.getNextMonth,
    [dispatcher.stream(events.timeline.getPreviousMonth)], timeline.getPreviousMonth,
    [dispatcher.stream(events.timeline.getRelatedNotification)], timeline.getRelatedNotification,
    [dispatcher.stream(events.timeline.edit)], timeline.edit,
    [dispatcher.stream(events.timeline.confirmRemove)], timeline.confirmRemove,

    // Editor
    [editor.saveBus], editor.onSaveComplete,
    [editor.saveFailedBus], editor.onSaveFailed,
    [editor.autoSaveBus], editor.onAutoSave,
    [editor.fetchReleaseBus], editor.onReleaseReceived,
    [editor.fetchReleaseFailedBus], editor.onFetchReleaseFailed,
    [editor.alertsBus], editor.onAlertsReceived,
    [dispatcher.stream(events.editor.open)], editor.open,
    [dispatcher.stream(events.editor.close)], editor.close,
    [dispatcher.stream(events.editor.editDraft)], editor.editDraft,
    [dispatcher.stream(events.editor.toggleTab)], editor.toggleTab,
    [dispatcher.stream(events.editor.togglePreview)], editor.togglePreview,
    [dispatcher.stream(events.editor.toggleHasSaveFailed)], editor.toggleHasSaveFailed,
    [dispatcher.stream(events.editor.removeAlert)], editor.removeAlert,
    [dispatcher.stream(events.editor.save)], editor.save,
    [dispatcher.stream(events.editor.saveDraft)], editor.saveDraft,

    [dispatcher.stream(events.editor.editNotification.update)], editor.editNotification.update,
    [dispatcher.stream(events.editor.editNotification.updateContent)], editor.editNotification.updateContent,
    [dispatcher.stream(events.editor.editNotification.setAsDisruptionNotification)],
    editor.editNotification.setAsDisruptionNotification,

    [dispatcher.stream(events.editor.editTimeline.updateItem)], editor.editTimeline.updateItem,
    [dispatcher.stream(events.editor.editTimeline.updateContent)], editor.editTimeline.updateContent,
    [dispatcher.stream(events.editor.editTimeline.add)], editor.editTimeline.add,
    [dispatcher.stream(events.editor.editTimeline.remove)], editor.editTimeline.remove,

    [dispatcher.stream(events.editor.targeting.update)], editor.targeting.update,
    [dispatcher.stream(events.editor.targeting.toggleTargetingGroup)], editor.targeting.toggleTargetingGroup,
    [dispatcher.stream(events.editor.targeting.removeTargetingGroup)], editor.targeting.removeTargetingGroup,
    [dispatcher.stream(events.editor.targeting.toggleCategory)], editor.targeting.toggleCategory,
    [dispatcher.stream(events.editor.targeting.toggleUserGroup)], editor.targeting.toggleUserGroup,
    [dispatcher.stream(events.editor.targeting.toggleTag)], editor.targeting.toggleTag,
    [dispatcher.stream(events.editor.targeting.toggleSendEmail)], editor.targeting.toggleSendEmail
  )
}

export function initAppState () {
  user.fetch()

  return setInitialState()
}
