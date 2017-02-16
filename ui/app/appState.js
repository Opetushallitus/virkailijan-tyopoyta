import Bacon from 'baconjs'
import R from 'ramda'
import moment from 'moment'

import view from './state/view'
import tags from './state/tags'
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
  timeline: timeline.events,
  notifications: notifications.events,
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
  notifications.fetch()

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
    categories: testData.viewCategories,
    view: view.initialState,
    unpublishedNotifications: {
      isVisible: false,
      items: []
    },
    notifications: notifications.initialState,
    timeline: timeline.initialState,
    editor: editor.initialState
  }

  onUserReceived(initialState, { language: 'fi' })

  return Bacon.update(
    initialState,

    // [userS], onUserReceived,

    // View
    [view.alertsBus], view.onAlertsReceived,
    [dispatcher.stream(events.view.toggleCategory)], view.toggleCategory,
    [dispatcher.stream(events.view.toggleTab)], view.toggleTab,
    [dispatcher.stream(events.view.removeAlert)], view.removeAlert,
    [dispatcher.stream(events.view.toggleMenu)], view.toggleMenu,

    // Tags
    [tags.bus], tags.onReceived,
    [tags.failedBus], tags.onFailed,

    // Notifications
    [notifications.bus], notifications.onReceived,
    [notifications.failedBus], notifications.onFailed,
    [dispatcher.stream(events.notifications.getPage)], notifications.getPage,
    [dispatcher.stream(events.notifications.toggleTag)], notifications.toggleTag,
    [dispatcher.stream(events.notifications.setSelectedTags)], notifications.setSelectedTags,
    [dispatcher.stream(events.notifications.toggle)], notifications.toggle,
    [dispatcher.stream(events.notifications.edit)], notifications.edit,
    [dispatcher.stream(events.notifications.toggleUnpublishedNotifications)], notifications.toggleUnpublishedNotifications,

    // Timeline
    [timeline.bus], timeline.onReceived,
    [timeline.failedBus], timeline.onFailed,
    [dispatcher.stream(events.timeline.getPreloadedMonth)], timeline.getPreloadedMonth,
    [dispatcher.stream(events.timeline.getPreviousMonth)], timeline.getPreviousMonth,
    [dispatcher.stream(events.timeline.getNextMonth)], timeline.getNextMonth,
    [dispatcher.stream(events.timeline.edit)], timeline.edit,

    // Editor
    [editor.savedReleasesBus], editor.onSaveComplete,
    [editor.failedReleasesBus], editor.onSaveFailed,
    [dispatcher.stream(events.editor.toggle)], editor.toggle,
    [dispatcher.stream(events.editor.toggleTab)], editor.toggleTab,
    [dispatcher.stream(events.editor.togglePreview)], editor.togglePreview,
    [dispatcher.stream(events.editor.toggleHasSaveFailed)], editor.toggleHasSaveFailed,
    [dispatcher.stream(events.editor.save)], editor.save,

    [dispatcher.stream(events.editor.editRelease.update)], editor.editRelease.update,
    [dispatcher.stream(events.editor.editRelease.toggleCategory)], editor.editRelease.toggleCategory,
    [dispatcher.stream(events.editor.editRelease.toggleUserGroup)], editor.editRelease.toggleUserGroup,
    [dispatcher.stream(events.editor.editRelease.updateFocusedCategory)], editor.editRelease.updateFocusedCategory,
    [dispatcher.stream(events.editor.editRelease.toggleFocusedUserGroup)], editor.editRelease.toggleFocusedUserGroup,

    [dispatcher.stream(events.editor.editTimeline.update)], editor.editTimeline.update,
    [dispatcher.stream(events.editor.editTimeline.updateContent)], editor.editTimeline.updateContent,
    [dispatcher.stream(events.editor.editTimeline.add)], editor.editTimeline.add,
    [dispatcher.stream(events.editor.editTimeline.remove)], editor.editTimeline.remove,

    [dispatcher.stream(events.editor.editNotification.update)], editor.editNotification.update,
    [dispatcher.stream(events.editor.editNotification.updateTags)], editor.editNotification.updateTags,
    [dispatcher.stream(events.editor.editNotification.updateContent)], editor.editNotification.updateContent
  )
}
