import Bacon from 'baconjs'
import R from 'ramda'

import Dispatcher from './dispatcher'
import { initController } from './controller'
import { validate, rules } from './validation'
import getData from './getData'
import * as testData from './resources/test/testData.json'
// import urls from './data/virkailijan-tyopoyta-urls.json'

const dispatcher = new Dispatcher()

const events = {
  // View
  updateView: 'updateView',
  toggleViewCategory: 'toggleViewCategory',
  toggleViewTab: 'toggleViewTab',
  removeViewAlert: 'removeViewAlert',

  // Editor
  addNotification: 'addNotification',
  deleteNotification: 'deleteNotification',
  toggleEditor: 'toggleEditor',
  toggleEditorTab: 'toggleEditorTab',
  toggleReleaseCategory: 'toggleReleaseCategory',
  toggleReleaseUserGroup: 'toggleReleaseUserGroup',
  updateFocusedReleaseCategory: 'updateFocusedReleaseCategory',
  toggleFocusedReleaseUserGroup: 'toggleFocusedReleaseUserGroup',
  updateRelease: 'updateRelease',
  updateNotification: 'updateNotification',
  updateNotificationTags: 'updateNotificationTags',
  updateNotificationContent: 'updateDocumentContent',
  validateNotification: 'validateNotification',
  addTimelineItem: 'addTimelineItem',
  removeTimelineItem: 'removeTimelineItem',
  updateTimeline: 'updateTimeline',
  updateTimelineContent: 'updateTimelineContent',
  toggleDocumentPreview: 'toggleDocumentPreview',
  toggleHasSaveFailed: 'toggleHasSaveFailed',
  saveDocument: 'saveDocument',

  // Menu
  toggleMenu: 'toggleMenu',

  // Notifications
  toggleUnpublishedNotifications: 'toggleUnpublishedNotifications',
  getNotifications: 'getNotifications',
  lazyLoadNotifications: 'lazyLoadNotifications',
  updateSearch: 'updateSearch',
  toggleNotificationTag: 'toggleNotificationTag',
  setSelectedNotificationTags: 'setSelectedNotificationTags',
  toggleNotification: 'toggleNotification'
}

// const authUrl = '/virkailijan-tyopoyta/login'
const notificationsUrl = '/virkailijan-tyopoyta/api/notifications'
const tagsUrl = '/virkailijan-tyopoyta/api/tags'
const timelineUrl = '/virkailijan-tyopoyta/api/timeline'

const controller = initController(dispatcher, events)

export function getController () {
  return controller
}

const alertsBus = new Bacon.Bus()
const notificationsBus = new Bacon.Bus()
const timelineBus = new Bacon.Bus()
const tagsBus = new Bacon.Bus()

function fetchNotifications () {
  console.log('Fetching releases')

  const alert = createAlert({
    type: 'error',
    title: 'Julkaisujen haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  getData({
    url: notificationsUrl,
    onSuccess: notifications => notificationsBus.push(notifications),
    onError: () => alertsBus.push(alert)
  })
}

function fetchTimeline () {
  console.log('Fetching timeline')

  const alert = createAlert({
    type: 'error',
    title: 'Aikajanan haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  const currentTime = new Date()
  const year = currentTime.getFullYear()
  const month = currentTime.getMonth() + 1

  getData({
    url: `${timelineUrl}?year=${year}&month=${month}`,
    onSuccess: timeline => timelineBus.push(timeline),
    onError: () => alertsBus.push(alert)
  })
}

function fetchTags () {
  console.log('Fetching tags')

  const alert = createAlert({
    type: 'error',
    title: 'Tunnisteiden haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  getData({
    url: tagsUrl,
    onSuccess: tags => tagsBus.push(tags),
    onError: () => alertsBus.push(alert)
  })
}

function onReleasesReceived (state, response) {
  console.log('Received releases')



  return R.assoc('releases', response, stateWithoutLoading)
}

function onNotificationsReceived (state, response) {
  console.log('Received notifications: ')

  const newState = R.assocPath(['view', 'isInitialLoad'], false, state)
  const stateWithoutLoading = R.assocPath(['view', 'isLoading'], false, newState)

  return R.assocPath(['notifications', 'items'], response, stateWithoutLoading)
}

function onTimelineReceived (state, response) {
  console.log('Received timeline')

  return R.assoc('timeline', [response], state)
}

function onTagsReceived (state, tags) {
  console.log('Received tags')

  const newState = R.assocPath(['notifications', 'tagsLoading'], false, state)

  return R.assocPath(['notifications', 'tags'], tags, newState)
}

function onAlertsReceived (state, alert) {
  console.log('Received alerts', alert)

  const newViewAlerts = R.append(alert, state.view.alerts)
  const newState = R.assocPath(['view', 'isInitialLoad'], false, state)
  const stateWithoutViewLoading = R.assocPath(['view', 'isLoading'], false, newState)
  const stateWithoutTagsLoading = R.assocPath(['notifications', 'tagsLoading'], false, stateWithoutViewLoading)

  return R.assocPath(['view', 'alerts'], newViewAlerts, stateWithoutTagsLoading)
}

function toggleValue (value, values) {
  let newValues

  R.contains(value, values)
    ? newValues = R.reject(val => val === value, values)
    : newValues = R.concat(values, value)

  return newValues
}

// VIEW

function updateView (state, { prop, value }) {
  console.log('Updating view', prop, value)

  return R.assocPath(['view', prop], value, state)
}

function toggleViewCategory (state, category) {
  console.log('Toggling view category', category)

  const categories = state.view.categories
  const newCategories = R.contains(category, categories)
    ? R.reject(c => c === category, categories)
    : R.append(category, categories)

  return updateView(state, { prop: 'categories', value: newCategories })
}

function toggleViewTab (state, selectedTab) {
  console.log('Toggling view tab', selectedTab)

  return updateView(state, { prop: 'selectedTab', value: selectedTab })
}

function createAlert (options) {
  // Use millisecond timestamp as ID
  const id = Date.now()

  return {
    id,
    ...options
  }
}

function removeViewAlert (state, id) {
  console.log('Removing alert with id', id)

  const newAlerts = R.reject(alert => alert.id === id, state.view.alerts)

  return updateView(state, { prop: 'alerts', value: newAlerts })
}

// EDITOR

function toggleEditor (state, releaseId = -1, selectedTab = 'edit-notification') {
  const newState = R.assocPath(['editor', 'isVisible'], !state.editor.isVisible, state)
  const stateWithoutError = R.assocPath(['editor', 'hasSaveFailed'], false, newState)

  // Toggle preview mode off and clear editor when closing
  if (state.editor.isVisible) {
    console.log('Closing editor')

    const stateWithClearedEditor = clearEditor(stateWithoutError)
    const stateWithoutLoading = R.assocPath(['editor', 'isLoading'], false, stateWithClearedEditor)

    return toggleDocumentPreview(stateWithoutLoading, false)
  }
  // Display correct tab depending if user edits a notification or a timeline item
  else if (releaseId > -1) {
    console.log('Toggling editor with release id', releaseId)

    const selectedRelease = state.releases.find(release => release.id === releaseId) ||
      state.unpublishedReleases.find(release => release.id === releaseId)

    const stateWithRelease = R.assocPath(['editor', 'editedRelease'], selectedRelease, stateWithoutError)

    return toggleEditorTab(stateWithRelease, selectedTab)
  }
  // Display notification tab when creating a new release
  else {
    return toggleEditorTab(stateWithoutError, selectedTab)
  }
}

function clearEditor (state) {
  console.log('Clearing editor')

  return R.assocPath(['editor', 'editedRelease'], emptyRelease(), state)
}

function toggleEditorTab (state, selectedTab) {
  console.log('Toggling editor tab', selectedTab)

  return R.assocPath(['editor', 'selectedTab'], selectedTab, state)
}

function toggleDocumentPreview (state, isPreviewed) {
  console.log('Toggling document preview', isPreviewed)

  return R.assocPath(['editor', 'isPreviewed'], isPreviewed, state)
}

function toggleHasSaveFailed (state, hasSaveFailed) {
  return R.assocPath(['editor', 'hasSaveFailed'], !state.editor.hasSaveFailed, state)
}

function cleanUpDocument (document) {
  return R.assoc('timeline', document.timeline.filter(tl => tl.date != null), document)
}

// RELEASE

function emptyRelease () {
  return {
    id: -1,
    sendEmail: false,
    notification: emptyNotification(),
    timeline: [newTimelineItem(-1, [])],
    categories: [],
    validationState: 'empty'
  }
}

function updateRelease (state, { prop, value }) {
  console.log('Updating release', prop, value)

  const path = ['editor', 'editedRelease']
  const newState = R.assocPath(R.append(prop, path), value, state)

  // Validate release
  const validatedRelease = validate(R.path(path, newState), rules['release']);

  return R.assocPath(path, validatedRelease, state)
}

function toggleReleaseCategory (state, category) {
  const categories = state.editor.editedRelease.categories;
  const newCategories = R.contains(category, categories)
    ? R.reject(c => c === category, categories)
    : R.append(category, categories)

  return updateRelease(state, { prop: 'categories', value: newCategories })
}

function toggleReleaseUserGroup (state, value) {
  const groups = state.editor.editedRelease.userGroups
  const newGroups = toggleValue(value, groups)

  return updateRelease(state, { prop: 'userGroups', value: newGroups })
}

function updateFocusedReleaseCategory (state, value) {
  return updateRelease(state, { prop: 'focusedCategory', value })
}

function toggleFocusedReleaseUserGroup (state, value) {
  const groups = state.editor.editedRelease.focusedUserGroups
  const newGroups = toggleValue(value, groups)

  return updateRelease(state, { prop: 'focusedUserGroups', value: newGroups })
}

// NOTIFICATION

function emptyContent (id, lang) {
  return {
    notificationId: id,
    text: '',
    title: '',
    language: lang,
  }
}

function emptyNotification () {
  return {
    id: -1,
    releaseId: -1,
    startDate: null,
    initialStartDate: null,
    endDate: null,
    content: {
      fi: emptyContent(-1, 'fi'),
      sv: emptyContent(-1, 'sv')
    },
    tags: [],
    validationState: 'empty'
  }
}

function updateNotification (state, {prop, value}) {
  // console.log('Updating notification', prop, value)

  // Concatenate path and prop
  let path = ['editor', 'editedRelease', 'notification']
  const concatenatedPath = R.is(Array, prop)
    ? path.concat(prop)
    : R.append(prop, path)

  const newState = R.assocPath(concatenatedPath, value, state)

  // Validate notification
  const validatedNotification = validate(R.path(path, newState), rules['notification'])

  return R.assocPath(path, validatedNotification, state)
}

function updateNotificationTags (state, value) {
  let newTags = value;

  // Remove an already selected tag
  if (R.is(Number, value)) {
    console.log('Removing notification tag', value)
    newTags = state.editor.editedRelease.notification.tags.filter(tag => (tag !== value))
  }

  return updateNotification(state, { prop: 'tags', value: newTags })
}

function updateNotificationContent (state, { prop, lang, value }) {
  return updateNotification(state, { prop: ['content', lang, prop], value: value })
}

// TIMELINE

const newTimelineId = R.compose(R.dec, R.apply(Math.min), R.map(R.prop('id')))

function newTimelineItem (releaseId, timeline) {
  //const id = Math.min(newTimelineId(timeline), 0);
  const id = Math.floor(Math.random() * (10000 - 1) + 1)

  return {
    id: id,
    releaseId: releaseId,
    initialDate: null,
    date: null,
    content: {
      fi: {timelineId: id, language: 'fi', text: ''},
      sv: {timelineId: id, language: 'sv', text: ''}
    },
    validationState: 'empty'
  }
}

function addTimelineItem (state, release) {
  const item = newTimelineItem(release.id, release.timeline)
  const newTimeline = R.append(item, release.timeline.slice())

  console.log('Adding new timeline item with id', item.id)

  return R.assocPath(['editor', 'editedRelease', 'timeline'], newTimeline, state)
}

function removeTimelineItem (state, id) {
  console.log('Removing new timeline item with id', id)

  const timeline = state.editor.editedRelease.timeline
  const index = R.findIndex(R.propEq('id', id), timeline)

  const newTimeline = [
    ...timeline.slice(0, index),
    ...timeline.slice(index + 1)
  ]

  return R.assocPath(['editor', 'editedRelease', 'timeline'], newTimeline, state)
}

function updateTimeline (state, { id, prop, value }) {
  console.log('Updating timeline item', id, prop, value);

  const timeline = state.editor.editedRelease.timeline
  const index = R.findIndex(R.propEq('id', id), timeline)
  const item = R.find(R.propEq('id', id), timeline)

  const newTimelineItem = R.is(Array, prop)
    ? R.assocPath(prop, value, item)
    : R.assoc(prop, value, item)

  const newTimeline = [
    ...timeline.slice(0, index),
    validate(newTimelineItem, rules['timelineItem']),
    ...timeline.slice(index + 1)
  ]

  return R.assocPath(['editor', 'editedRelease', 'timeline'], newTimeline, state)
}

function updateTimelineContent (state, { id, lang, prop, value }) {
  return updateTimeline(state, {id, prop: ['content', lang, prop], value})
}

function removeDocumentProperties (key, value) {
  if (key === 'validationState') {
    return undefined
  }

  return value
}

const savedReleases = new Bacon.Bus()
const failedReleases = new Bacon.Bus()

function saveDocument (state) {
  console.log('Saving document')

  getData({
    url: notificationsUrl,
    requestOptions: {
      method: 'POST',
      dataType: 'json',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(cleanUpDocument(state.editor.editedRelease), state.editor.onSave)
    },
    onSuccess: json => savedReleases.push(json),
    onError: error => failedReleases.push(error)
  })

  return R.assocPath(['editor', 'isLoading'], true, state)
}

function onSaveComplete (state) {
  console.log('Release saved')

  const alert = createAlert({
    type: 'success',
    title: 'Julkaisu onnistui'
  })

  const newViewAlerts = R.append(alert, state.view.alerts)
  const stateWithAlert = R.assocPath(['view', 'alerts'], newViewAlerts, state)
  const stateWithLoading = R.assocPath(['view', 'isLoading'], true, stateWithAlert)

  // Update view
  fetchNotifications()
  fetchTimeline()

  // Only toggle editor if user hasn't closed it already
  return toggleEditor(stateWithLoading)
}

function onSaveFailed (state) {
  console.log('Saving release failed')

  const newState = R.assocPath(['editor', 'isLoading'], false, state)

  return R.assocPath(['editor', 'hasSaveFailed'], true, newState)
}

function emptyContent (id, lang) {
  return {
    notificationId: id,
    text: "",
    title: "",
    language: lang,
  }
}

function emptyNotification () {
  return {
    id: -1,
    releaseId: -1,
    startDate: null,
    initialStartDate: null,
    endDate: null,
    content: {
      fi: emptyContent(-1, 'fi'),
      sv: emptyContent(-1, 'sv')
    },
    tags: [],
    validationState: 'empty'
  }
}

function emptyRelease () {
  return {
    id: -1,
    sendEmail: false,
    notification: emptyNotification(),
    timeline: [newTimelineItem(-1, [])],
    categories: [],
    userGroups: [],
    focusedCategory: null,
    focusedUserGroups: [],
    validationState: 'empty'
  }
}

// MENU

function toggleMenu (state) {
  return R.assocPath(['menu', 'isMobileMenuVisible'], !state.menu.isMobileMenuVisible, state)
}

// NOTIFICATIONS

function toggleUnpublishedNotifications (state, releaseId) {
  console.log('Toggling unpublished notifications')

  const newState = R.assocPath(
    ['unpublishedNotifications', 'isVisible'],
    !state.unpublishedNotifications.isVisible, state
  )

  if (releaseId > 0) {
    return toggleEditor(newState, releaseId)
  }

  return newState
}

function getNotifications (state, value) {
  console.log('Get notifications from page')

  return R.assoc('isLoading', value.isLoading, state)
}

function lazyLoadNotifications (state, value) {
  if (!state.isLoading) {
    return getNotifications(state, value)
  }
  else {
    return state
  }
}

function updateSearch(state, {search}){
  return R.assoc('filter', search, state)
}

function toggleNotificationTag (state, value) {
  console.log('Toggled tag with value', value)

  const isSelected = state.notifications.selectedTags.indexOf(value) >= 0
  let newTags = []

  // Remove an already selected tag
  if (isSelected) {
    newTags = state.notifications.selectedTags.filter(tag => (tag !== value))
  }
  // Set tag to state if not selected
  else {
    newTags = state.notifications.selectedTags.concat(value)
  }

  return setSelectedNotificationTags(state, newTags)
}

function setSelectedNotificationTags (state, value) {
  console.log('Updating selected notification tags', value)

  return R.assocPath(
    ['notifications', 'selectedTags'],
    value,
    state
  )
}

function toggleNotification (state, id) {
  console.log('Toggling notification', id)

  const index = state.notifications.expanded.indexOf(id)

  const newState = index >= 0
    ? R.remove(index, 1, state.notifications.expanded)
    : R.append(id, state.notifications.expanded)

  return R.assocPath(['notifications', 'expanded'], newState, state)
}

export function initAppState () {
  function onUserReceived(state, response){
    console.log("received user: "+JSON.stringify(response))

    fetchNotifications()
    fetchTags()
    fetchTimeline()

    return R.assoc('user', response, state)
  }

  //Disabloidaan auth kunnes saadaan testattua
  // const userS = Bacon.fromPromise(fetch(authUrl, {mode: 'no-cors'}).then(resp => {
  //   resp.json()
  // }))

  // const notificationsS = notificationsBus.flatMapLatest(r => R.map(r => r.notification, r))

  const initialState = {
    locale: 'fi',
    dateFormat: 'D.M.YYYY',
    categories: testData.viewCategories,
    menu: {
      isMobileMenuVisible: false
    },
    view: {
      categories: [],
      startDate: '',
      endDate: '',
      selectedTab: 'notifications',
      alerts: [],
      isLoading: true,
      isInitialLoad: true
    },
    releases: [],
    notifications: {
      items: [],
      expanded: [],
      tags: [],
      tagsLoading: true,
      selectedTags: [],
      isLoading: false
    },
    unpublishedNotifications: {
      isVisible: false,
      items: testData.unpublishedReleases.map(r => r.notification)
    },
    timeline: [],
    editor: {
      isVisible: false,
      isPreviewed: false,
      isLoading: false,
      hasSaveFailed: false,
      categories: testData.releaseCategories,
      userGroups: testData.userGroups,
      editedRelease: emptyRelease(),
      selectedTab: 'edit-notification',
      onSave: removeDocumentProperties
    }
  }

  onUserReceived(initialState, { language: 'fi' })

  return Bacon.update(
    initialState,

    // View
    [dispatcher.stream(events.updateView)], updateView,
    [dispatcher.stream(events.toggleViewCategory)], toggleViewCategory,
    [dispatcher.stream(events.toggleViewTab)], toggleViewTab,
    [dispatcher.stream(events.removeViewAlert)], removeViewAlert,

    // Editor
    [dispatcher.stream(events.toggleEditor)], toggleEditor,
    [dispatcher.stream(events.toggleEditorTab)], toggleEditorTab,
    [dispatcher.stream(events.updateRelease)], updateRelease,
    [dispatcher.stream(events.updateNotification)], updateNotification,
    [dispatcher.stream(events.updateNotificationTags)], updateNotificationTags,
    [dispatcher.stream(events.updateNotificationContent)], updateNotificationContent,
    [dispatcher.stream(events.addTimelineItem)], addTimelineItem,
    [dispatcher.stream(events.removeTimelineItem)], removeTimelineItem,
    [dispatcher.stream(events.updateTimeline)], updateTimeline,
    [dispatcher.stream(events.updateTimelineContent)], updateTimelineContent,
    [dispatcher.stream(events.toggleReleaseCategory)], toggleReleaseCategory,
    [dispatcher.stream(events.toggleReleaseUserGroup)], toggleReleaseUserGroup,
    [dispatcher.stream(events.updateFocusedReleaseCategory)], updateFocusedReleaseCategory,
    [dispatcher.stream(events.toggleFocusedReleaseUserGroup)], toggleFocusedReleaseUserGroup,
    [dispatcher.stream(events.toggleDocumentPreview)], toggleDocumentPreview,
    [dispatcher.stream(events.toggleHasSaveFailed)], toggleHasSaveFailed,
    [dispatcher.stream(events.saveDocument)], saveDocument,

    // Menu
    [dispatcher.stream(events.toggleMenu)], toggleMenu,

    // Notifications
    [dispatcher.stream(events.toggleUnpublishedNotifications)], toggleUnpublishedNotifications,
    [dispatcher.stream(events.getNotifications)], getNotifications,
    [dispatcher.stream(events.lazyLoadNotifications)], lazyLoadNotifications,
    [dispatcher.stream(events.updateSearch)], updateSearch,
    [dispatcher.stream(events.toggleNotificationTag)], toggleNotificationTag,
    [dispatcher.stream(events.setSelectedNotificationTags)], setSelectedNotificationTags,
    [dispatcher.stream(events.toggleNotification)], toggleNotification,

    // [userS], onUserReceived,
    // [releasesS], onReleasesReceived,
    [timelineBus], onTimelineReceived,
    [tagsBus], onTagsReceived,
    [notificationsBus], onNotificationsReceived,
    [savedReleases], onSaveComplete,
    [failedReleases], onSaveFailed,
    [alertsBus], onAlertsReceived
  )
}
