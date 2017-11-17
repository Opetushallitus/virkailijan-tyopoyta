import Bacon from 'baconjs'
import moment from 'moment'

import user from './state/user'
import translations from './state/translations'
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
  editor: editor.events,
  user: user.events
}

const initialState = {
  defaultLocale: 'fi',
  dateFormat: 'D.M.YYYY',
  draftKey: 'virkailijanTyopoytaDraft',
  draft: null,
  user: user.initialState,
  translations: translations.initialState,
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

// Application state stream
export function appState () {
  return Bacon.update(
    initialState,

    // User
    [user.fetchBus], user.onReceived,
    [user.fetchFailedBus], user.onFetchFailed,
    [user.saveSendEmailFailedBus], user.onSaveSendEmailFailed,
    [dispatcher.stream(events.user.saveSendEmail)], user.saveSendEmail

    // Translations
    [translations.fetchBus], translations.onReceived,
    [translations.fetchFailedBus], translations.onFetchFailed,

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
    [targetingGroups.saveFailedBus], targetingGroups.onSaveFailed,
    [targetingGroups.removeBus], targetingGroups.onRemoveComplete,
    [targetingGroups.removeFailedBus], targetingGroups.onRemoveFailed,

    // View
    [view.alertsBus], view.onAlertsReceived,
    [dispatcher.stream(view.toggleTab)], view.toggleTab,
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
    [notifications.releaseRemovedBus], notifications.onReleaseRemoved,
    [notifications.removeReleaseFailedBus], notifications.onRemoveReleaseFailed,
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
    [timeline.itemRemovedBus], timeline.onItemRemoved,
    [timeline.removeItemFailedBus], timeline.onRemoveItemFailed,
    [dispatcher.stream(events.timeline.getPreloadedMonth)], timeline.getPreloadedMonth,
    [dispatcher.stream(events.timeline.getNextMonth)], timeline.getNextMonth,
    [dispatcher.stream(events.timeline.getPreviousMonth)], timeline.getPreviousMonth,
    [dispatcher.stream(events.timeline.autoFetchNextMonth)], timeline.autoFetchNextMonth,
    [dispatcher.stream(events.timeline.getRelatedNotification)], timeline.getRelatedNotification,
    [dispatcher.stream(events.timeline.edit)], timeline.edit,
    [dispatcher.stream(events.timeline.confirmRemove)], timeline.confirmRemove,

    // Editor
    [editor.saveBus], editor.onSaveComplete,
    [editor.saveFailedBus], editor.onSaveFailed,
    [editor.autoSaveBus], editor.onAutoSave,
    [editor.sendEmailBus], editor.onEmailSent,
    [editor.sendEmailFailedBus], editor.onSendEmailFailed,
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

// Fetch all necessary initial data for state
export function getStateData (state) {
  const month = moment().format('M')
  const year = moment().format('YYYY')

  categories.fetch()
  userGroups.fetch()
  tagGroups.fetch()
  targetingGroups.fetch()

  specialNotifications.fetch()

  notifications.fetch({
    page: 1,
    categories: state.user.profile.categories
  })

  timeline.fetch({
    month,
    year
  })
}

export function initAppState () {
  user.fetch()

  return appState()
}
