import Bacon from 'baconjs'
import R from 'ramda'

import Dispatcher from './dispatcher'
import { initController } from './controller'
import { validate, rules } from './validation'
import * as testData from './resources/test/testData.json'

const dispatcher = new Dispatcher()

const events = {
  // Editor
  addNotification: 'addNotification',
  deleteNotification: 'deleteNotification',
  toggleEditor: 'toggleEditor',
  toggleEditorTab: 'toggleEditorTab',
  toggleReleaseCategory : 'toggleReleaseCategory',
  updateRelease: 'updateRelease',
  updateNotification: 'updateNotification',
  updateNotificationTags: 'updateNotificationTags',
  updateNotificationContent: 'updateDocumentContent',
  validateNotification: 'validateNotification',
  addTimelineItem: 'addTimelineItem',
  updateTimeline: 'updateTimeline',
  updateTimelineContent: 'updateTimelineContent',
  toggleDocumentPreview: 'toggleDocumentPreview',
  saveDocument: 'saveDocument',

  // Menu
  toggleMenu: 'toggleMenu',

  // Notifications
  getNotifications: 'getNotifications',
  lazyLoadNotifications: 'lazyLoadNotifications',
  updateSearch: 'updateSearch',
  toggleNotificationTag: 'toggleNotificationTag',
  setSelectedNotificationTags: 'setSelectedNotificationTags',
  toggleNotification: 'toggleNotification'
}

const notificationsUrl = "/virkailijan-tyopoyta/api/releases";
const controller = initController(dispatcher, events)

export function getController () {
  return controller;
}

function onReleasesReceived(state, response){
  console.log("received releases: "+JSON.stringify(response) );

  return R.assoc('releases', response, state)
}

function onNotificationsReceived(state, response){
  //console.log("received notifications: "+JSON.stringify(response) );

  return R.assoc('notifications', response, state)
}

function onTimelineReceived(state, response){
  //console.log("received timeline: "+JSON.stringify(response) );

  return R.assoc('timeline', response, state)
}

// EDITOR

function toggleEditor (state, { isVisible, releaseId = -1, selectedTab = 'edit-notification' }) {
  const newState = R.assocPath(['editor', 'isVisible'], isVisible, state)

  // Toggle preview mode off and clear editor when closing
  if (!isVisible) {
    console.log('Closing editor')

    const stateWithClearedEditor = clearEditor(newState)

    return toggleDocumentPreview(stateWithClearedEditor, false)
  }
  // Display correct tab depending if user edits a notification or a timeline item.
  else if (releaseId > -1) {
    console.log('Toggling editor with release id', releaseId)

    const selectedRelease = state.releases.filter(release => release.id === releaseId)[0];
    const stateWithRelease = R.assocPath(['editor', 'document'], selectedRelease, newState)

    return toggleEditorTab(stateWithRelease, 'edit-notification')
  }
  // Display notification tab when creating a new release
  else {
    return toggleEditorTab(newState, selectedTab)
  }
}

function clearEditor (state) {
  console.log('Clearing editor')

  return R.assocPath(['editor', 'document'], emptyRelease(), state)
}

function toggleEditorTab (state, selectedTab) {
  console.log('Toggling editor tab', selectedTab)

  return R.assocPath(['editor', 'selectedTab'], selectedTab, state)
}

function toggleDocumentPreview (state, isPreviewed) {
  console.log('Toggling document preview', isPreviewed)

  return R.assocPath(['editor', 'isPreviewed'], isPreviewed, state)
}

function saveDocument (state) {
  console.log('Saving document', JSON.stringify(state.editor.document))

  fetch(notificationsUrl + '/addRelease', {
    method: 'POST',
    dataType: 'json',
    headers: {
      'Content-type': 'text/json; charset=UTF-8'
    },
    body: JSON.stringify(state.editor.document),
  });

  return state
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

  const path = ['editor', 'document']
  const newState = R.assocPath(R.append(prop, path), value, state)

  // Validate release
  const validatedRelease = validate(R.path(path, newState), rules['release']);

  return R.assocPath(path, validatedRelease, state)
}

function toggleReleaseCategory (state, category) {
  console.log('Toggling release category', category);

  const categories = state.editor.document.categories;
  const newCategories = R.contains(category, categories)
    ? R.reject((c => c === category), categories)
    : R.append(category, categories)

  return updateRelease(state, { prop: 'categories', value: newCategories })
}

// NOTIFICATION

function emptyContent (id ,lang) {
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

function updateNotification (state, {prop, value}) {
  console.log('Updating notification', prop, value)

  // Concatenate path and prop
  let path = ['editor', 'document', 'notification']
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
    newTags = state.editor.document.notification.tags.filter(tag => (tag !== value))
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

  return R.assocPath(['editor', 'document', 'timeline'], newTimeline, state)
}

function updateTimeline (state, { id, prop, value }) {
  console.log('Updating timeline item', id, prop, value);

  const timeline = state.editor.document.timeline
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

  return R.assocPath(['editor', 'document', 'timeline'], newTimeline, state)
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

function saveDocument (state) {
  console.log('Saving document')

  fetch(notificationsUrl, {
    method: 'POST',
    dataType: 'json',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(state.editor.document, state.editor.onSave)
  });

  return state;
}

function emptyContent (id ,lang) {
  return {
    notificationId: id,
    text: "",
    title: "",
    language: lang,
  }
}

function emptyNotification () {
  return{
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
    validationState: 'empty'
  }
}

// MENU

function toggleMenu (state, isVisible) {
  return R.assocPath(['menu', 'isVisible'], isVisible, state)
}

// NOTIFICATIONS

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
  const isSelected = state.selectedNotificationTags.indexOf(value) >= 0
  let newTags = []

  // Remove an already selected tag
  if (isSelected) {
    console.log('Notification tag removed, updating state')
    newTags = state.selectedNotificationTags.filter(tag => (tag !== value))
  }
  // Set tag to state if not selected
  else {
    console.log('Notification tag selected, updating state')
    newTags = state.selectedNotificationTags.concat(value)
  }

  return setSelectedNotificationTags(state, newTags)
}

function setSelectedNotificationTags (state, value) {
  console.log('Updating selected notification tags')

  return R.assoc(
    'selectedNotificationTags',
    value,
    state
  )
}

function toggleNotification (state, {id}) {
  const idx = state.expandedNotifications.indexOf(id);

  if(idx >= 0){
    return R.assoc('expandedNotifications', state.expandedNotifications.filter(n =>( n != id)), state)
  }

  return R.assoc('expandedNotifications', state.expandedNotifications.concat(id), state)
}

export function initAppState() {
  const releasesS = Bacon.fromPromise(fetch(notificationsUrl).then(resp => resp.json()));
  //const releasesS = testData.releases
  const notificationsS = releasesS.flatMapLatest(r => R.map(r => r.notification, r))
  const timelineS = releasesS.flatMapLatest(r => R.map(r => r.timeline, r))

  const initialState = {
    locale: 'fi',
    dateFormat: 'D.M.YYYY',
    // TODO: These should be per data set, e.g. notifications.isLoading, timeline.isLoading
    isLoading: false,
    currentPage: 1,
    nextPage: 2,
    categories: testData.categories,
    releases: releasesS,
    hasUnpublishedReleases: false,
    notifications: notificationsS,
    notificationTags: testData.notificationTags,
    selectedNotificationTags: [],
    timeline: [],
    expandedNotifications: [],
    activeFilter: '',
    menu: {
      isVisible: false
    },
    editor: {
      isVisible: false,
      isPreviewed: false,
      document: emptyRelease(),
      selectedTab: 'edit-notification',
      onSave: removeDocumentProperties
    }
  }

  return Bacon.update(
    initialState,

    // Editor
    [dispatcher.stream(events.toggleEditor)], toggleEditor,
    [dispatcher.stream(events.toggleEditorTab)], toggleEditorTab,
    [dispatcher.stream(events.updateRelease)], updateRelease,
    [dispatcher.stream(events.updateNotification)], updateNotification,
    [dispatcher.stream(events.updateNotificationTags)], updateNotificationTags,
    [dispatcher.stream(events.updateNotificationContent)], updateNotificationContent,
    [dispatcher.stream(events.addTimelineItem)], addTimelineItem,
    [dispatcher.stream(events.updateTimeline)], updateTimeline,
    [dispatcher.stream(events.updateTimelineContent)], updateTimelineContent,
    [dispatcher.stream(events.toggleReleaseCategory)], toggleReleaseCategory,
    [dispatcher.stream(events.toggleDocumentPreview)], toggleDocumentPreview,
    [dispatcher.stream(events.saveDocument)], saveDocument,

    // Menu
    [dispatcher.stream(events.toggleMenu)], toggleMenu,

    // Notifications
    [dispatcher.stream(events.getNotifications)], getNotifications,
    [dispatcher.stream(events.lazyLoadNotifications)], lazyLoadNotifications,
    [dispatcher.stream(events.updateSearch)], updateSearch,
    [dispatcher.stream(events.toggleNotificationTag)], toggleNotificationTag,
    [dispatcher.stream(events.setSelectedNotificationTags)], setSelectedNotificationTags,
    [dispatcher.stream(events.toggleNotification)], toggleNotification,

    [releasesS], onReleasesReceived,
    [notificationsS], onNotificationsReceived,
    [timelineS], onTimelineReceived
  )
}
