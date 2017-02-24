import Bacon from 'baconjs'
import R from 'ramda'
import moment from 'moment'

import tags from './state/tags'
import userGroups from './state/userGroups'
import view from './state/view'
import unpublishedNotifications from './state/unpublishedNotifications'
import notifications from './state/notifications'
import timeline from './state/timeline'
import editor from './state/editor/editor'

import Dispatcher from './dispatcher'
import { initController } from './controller'
import * as testData from './resources/test/testData.json'
// import urls from './data/virkailijan-tyopoyta-urls.json'

const dispatcher = new Dispatcher()

const events = {
  view: view.events,
  tags: tags.events,
  unpublishedNotifications: unpublishedNotifications.events,
  notifications: notifications.events,
  timeline: timeline.events,
  editor: editor.events
}

// const authUrl = '/virkailijan-tyopoyta/login'

const controller = initController(dispatcher, events)

export function getController () {
  return controller
}

function onUserReceived (state, response) {
  console.log('Received user')

  const month = moment().format('M')
  const year = moment().format('YYYY')

  tags.fetch()
  notifications.fetch(1)

  timeline.fetch({
    month,
    year
  })

  return R.assoc('user', response, state)
}

export function initAppState () {
  //Disabloidaan auth kunnes saadaan testattua
  // const userS = Bacon.fromPromise(fetch(authUrl, {mode: 'no-cors'}).then(resp => {
  //   resp.json()
  // }))

  const initialState = {
    locale: 'fi',
    dateFormat: 'D.M.YYYY',
    userGroups: userGroups.initialState,
    categories: {
      items: testData.categories
    },
    tags: tags.initialState,
    view: view.initialState,
    unpublishedNotifications: unpublishedNotifications.initialState,
    notifications: notifications.initialState,
    timeline: timeline.initialState,
    editor: editor.initialState
  }

  onUserReceived(initialState, { language: 'fi' })

  return Bacon.update(
    initialState,

    // [userS], onUserReceived,

    // Tags
    [tags.bus], tags.onReceived,
    [tags.failedBus], tags.onFailed,
    [dispatcher.stream(events.tags.toggle)], tags.toggle,
    [dispatcher.stream(events.tags.setSelectedItems)], tags.setSelectedItems,

    // User groups
    [userGroups.fetchBus], userGroups.onReceived,
    [userGroups.fetchFailedBus], userGroups.onFailed,

     // View
    [view.alertsBus], view.onAlertsReceived,
    [dispatcher.stream(events.view.toggleCategory)], view.toggleCategory,
    [dispatcher.stream(events.view.toggleTab)], view.toggleTab,
    [dispatcher.stream(events.view.removeAlert)], view.removeAlert,
    [dispatcher.stream(events.view.toggleMenu)], view.toggleMenu,

    // Unpublished notifications
    [unpublishedNotifications.fetchBus], unpublishedNotifications.onReceived,
    [unpublishedNotifications.fetchFailedBus], unpublishedNotifications.onFailed,
    [dispatcher.stream(events.unpublishedNotifications.toggle)], unpublishedNotifications.toggle,
    [dispatcher.stream(events.unpublishedNotifications.edit)], unpublishedNotifications.edit,
    [dispatcher.stream(events.unpublishedNotifications.removeAlert)], unpublishedNotifications.removeAlert,

    // Notifications
    [notifications.fetchBus], notifications.onReceived,
    [notifications.fetchFailedBus], notifications.onFailed,
    [dispatcher.stream(events.notifications.getPage)], notifications.getPage,
    [dispatcher.stream(events.notifications.toggle)], notifications.toggle,
    [dispatcher.stream(events.notifications.edit)], notifications.edit,
    [dispatcher.stream(events.notifications.toggleUnpublishedNotifications)], notifications.toggleUnpublishedNotifications,

    // Timeline
    [timeline.bus], timeline.onReceived,
    [timeline.failedBus], timeline.onFailed,
    [dispatcher.stream(events.timeline.getPreloadedMonth)], timeline.getPreloadedMonth,
    [dispatcher.stream(events.timeline.getNextMonth)], timeline.getNextMonth,
    [dispatcher.stream(events.timeline.getPreviousMonth)], timeline.getPreviousMonth,
    [dispatcher.stream(events.timeline.edit)], timeline.edit,

    // Editor
    [editor.saveBus], editor.onSaveComplete,
    [editor.saveFailedBus], editor.onSaveFailed,
    [editor.fetchBus], editor.onReleaseReceived,
    [editor.fetchFailedBus], editor.onFetchFailed,
    [dispatcher.stream(events.editor.toggle)], editor.toggle,
    [dispatcher.stream(events.editor.toggleTab)], editor.toggleTab,
    [dispatcher.stream(events.editor.togglePreview)], editor.togglePreview,
    [dispatcher.stream(events.editor.toggleHasSaveFailed)], editor.toggleHasSaveFailed,
    [dispatcher.stream(events.editor.removeAlert)], editor.removeAlert,
    [dispatcher.stream(events.editor.save)], editor.save,
    [dispatcher.stream(events.editor.saveDraft)], editor.saveDraft,

    [dispatcher.stream(events.editor.editTimeline.update)], editor.editTimeline.update,
    [dispatcher.stream(events.editor.editTimeline.updateContent)], editor.editTimeline.updateContent,
    [dispatcher.stream(events.editor.editTimeline.add)], editor.editTimeline.add,
    [dispatcher.stream(events.editor.editTimeline.remove)], editor.editTimeline.remove,

    [dispatcher.stream(events.editor.editNotification.update)], editor.editNotification.update,
    [dispatcher.stream(events.editor.editNotification.updateContent)], editor.editNotification.updateContent,

    [dispatcher.stream(events.editor.targeting.update)], editor.targeting.update,
    [dispatcher.stream(events.editor.targeting.toggleCategory)], editor.targeting.toggleCategory,
    [dispatcher.stream(events.editor.targeting.toggleUserGroup)], editor.targeting.toggleUserGroup,
    [dispatcher.stream(events.editor.targeting.toggleTag)], editor.targeting.toggleTag
  )
}
