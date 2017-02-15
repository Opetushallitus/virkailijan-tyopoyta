import Bacon from 'baconjs'
import R from 'ramda'
import moment from 'moment'

import view from './state/view'

import Dispatcher from './dispatcher'
import { initController } from './controller'
import { validate, rules } from './validation'
import getData from './utils/getData'
import createAlert from './utils/createAlert'
import * as testData from './resources/test/testData.json'
// import urls from './data/virkailijan-tyopoyta-urls.json'

const dispatcher = new Dispatcher()

const events = {
  view: {
    update: 'update',
    toggleCategory: 'toggleCategory',
    toggleTab: 'toggleTab',
    toggleMenu: 'toggleMenu',
    removeAlert: 'removeAlert'
  },

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

  // Notifications
  toggleUnpublishedNotifications: 'toggleUnpublishedNotifications',
  getNotifications: 'getNotifications',
  lazyLoadNotifications: 'lazyLoadNotifications',
  updateSearch: 'updateSearch',
  toggleNotificationTag: 'toggleNotificationTag',
  setSelectedNotificationTags: 'setSelectedNotificationTags',
  toggleNotification: 'toggleNotification',

  // Timeline
  getPreloadedMonth: 'getPreloadedMonth',
  getPreviousMonth: 'getPreviousMonth',
  getNextMonth: 'getNextMonth'
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
const failedNotificationsBus = new Bacon.Bus()
const timelineBus = new Bacon.Bus()
const failedTimelineBus = new Bacon.Bus()
const tagsBus = new Bacon.Bus()
const failedTagsBus = new Bacon.Bus()

function fetchNotifications () {
  console.log('Fetching releases')

  getData({
    url: notificationsUrl,
    onSuccess: notifications => notificationsBus.push(notifications),
    onError: error => failedNotificationsBus.push(error)
  })
}

function fetchTimeline (options) {
  console.log('Fetching timeline')

  const {
    month,
    year
  } = options

  getData({
    url: timelineUrl,
    searchParams: {
      month,
      year
    },
    onSuccess: timeline => timelineBus.push(timeline),
    onError: (error) => failedTimelineBus.push(error)
  })
}

function fetchTags () {
  console.log('Fetching tags')

  getData({
    url: tagsUrl,
    onSuccess: tags => tagsBus.push(tags),
    onError: error => failedTagsBus.push(error)
  })
}

function onNotificationsReceived (state, response) {
  console.log('Received notifications')

  const newState = R.assocPath(['notifications', 'isInitialLoad'], false, state)
  const stateWithoutLoading = R.assocPath(['notifications', 'isLoading'], false, newState)

  return R.assocPath(['notifications', 'items'], response, stateWithoutLoading)
}

function onNotificationsFailed (state) {
  const alert = createAlert({
    type: 'error',
    title: 'Tiedotteiden haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  const newState = R.assocPath(['notifications', 'isInitialLoad'], false, state)
  const stateWithoutLoading = R.assocPath(['notifications', 'isLoading'], false, newState)

  alertsBus.push(alert)

  return stateWithoutLoading
}

function onCurrentMonthReceived (state, response) {
  const currentDate = new Date()
  const currentDay = currentDate.getUTCDate()
  const isCurrentDayOrAfter = (value, key) => key >= currentDay

  // Get month's current day and the days after it
  const visibleDays = R.pickBy(isCurrentDayOrAfter, response.days)
  const visibleMonth = R.assoc('days', visibleDays, response)

  // Get month's past days
  const pastDays = R.omit(Object.keys(visibleDays), response.days)
  const partOfMonth = R.assoc('part', 2, response)
  const pastMonth = R.assoc('days', pastDays, partOfMonth)

  const newState = R.assocPath(['timeline', 'preloadedItems'], [pastMonth], state)
  const stateWithCount = R.assocPath(['timeline', 'count'], Object.keys(visibleDays).length, newState)

  return R.assocPath(['timeline', 'items'], [visibleMonth], stateWithCount)
}

function onNewMonthReceived (state, options) {
  const {
    response,
    dateFormat,
    timeline
  } = options

  const requestedDateMoment = moment(`${response.month}.${response.year}`, dateFormat)

  const firstMonth = R.head(timeline.items)
  const firstMonthMoment = moment(`${firstMonth.month}.${firstMonth.year}`, dateFormat)

  const newCount = () => {
    const count = Object.keys(response.days).length || 1
    return timeline.count + count
  }

  const stateWithCount = R.assocPath(['timeline', 'count'], newCount(), state)

  // Returned date is before first month and year
  if (requestedDateMoment.isBefore(firstMonthMoment)) {
    const newState = R.assocPath(['timeline', 'direction'], 'up', stateWithCount)
    const stateWithoutLoading = R.assocPath(['timeline', 'isLoadingPrevious'], false, newState)

    const newItems = R.prepend(response, timeline.items)

    return R.assocPath(['timeline', 'items'], newItems, stateWithoutLoading)
  } else {
    // Returned date is after last month and year

    const newState = R.assocPath(['timeline', 'direction'], 'down', stateWithCount)
    const stateWithoutLoading = R.assocPath(['timeline', 'isLoadingNext'], false, newState)

    const newItems = R.append(response, timeline.items)

    return R.assocPath(['timeline', 'items'], newItems, stateWithoutLoading)
  }
}

function onTimelineReceived (state, response) {
  console.log('Received timeline')

  const timeline = state.timeline
  const dateFormat = timeline.dateFormat

  const newState = R.assocPath(['timeline', 'hasLoadingFailed'], false, state)
  const stateWithoutLoading = R.assocPath(['timeline', 'isInitialLoad'], false, newState)

  if (timeline.isInitialLoad) {
    return onCurrentMonthReceived(stateWithoutLoading, response)
  } else {
    return onNewMonthReceived(stateWithoutLoading, {
      response,
      dateFormat,
      timeline
    })
  }
}

function onTimelineFailed (state) {
  const alert = createAlert({
    type: 'error',
    title: 'Tapahtumien haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  const newState = R.assocPath(['timeline', 'isLoadingNext'], false, state)
  const stateWithoutLoadingPrevious = R.assocPath(['timeline', 'isLoadingPrevious'], false, newState)
  const stateWithFailedTimeline = R.assocPath(['timeline', 'hasLoadingFailed'], true, stateWithoutLoadingPrevious)
  const stateIsReady = R.assocPath(['timeline', 'isInitialLoad'], false, stateWithFailedTimeline)

  alertsBus.push(alert)

  return stateIsReady
}

function onTagsReceived (state, tags) {
  console.log('Received tags')

  const newState = R.assocPath(['notifications', 'tagsLoading'], false, state)

  return R.assocPath(['notifications', 'tags'], tags, newState)
}

function onTagsFailed (state) {
  const alert = createAlert({
    type: 'error',
    title: 'Tunnisteiden haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  alertsBus.push(alert)

  return R.assocPath(['tags', 'isLoading'], false, state)
}

function onAlertsReceived (state, alert) {
  console.log('Received alerts', alert)

  const newViewAlerts = R.append(alert, state.view.alerts)

  return R.assocPath(['view', 'alerts'], newViewAlerts, state)
}

function toggleValue (value, values) {
  let newValues

  R.contains(value, values)
    ? newValues = R.reject(val => val === value, values)
    : newValues = R.concat(values, value)

  return newValues
}

// EDITOR

function toggleEditor (state, releaseId = -1, selectedTab = 'edit-notification') {
  const newState = R.assocPath(['editor', 'isVisible'], !state.editor.isVisible, state)
  const stateWithoutError = R.assocPath(['editor', 'hasSaveFailed'], false, newState)

  document.body.classList.add('overflow-hidden')

  // Toggle preview mode off and clear editor when closing
  if (state.editor.isVisible) {
    console.log('Closing editor')

    document.body.classList.remove('overflow-hidden')

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
  let newTags = value

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

// Returns last timeline item's ID + 1
function getNewTimelineItemId (timeline) {
  return R.inc(R.prop('id', R.last(timeline)))
}

function newTimelineItem (releaseId, timeline) {
  const id = timeline.length
    ? getNewTimelineItemId(timeline)
    : 1

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

  const currentMonth = getCurrentMonth()
  const currentYear = getCurrentYear()

  const alert = createAlert({
    type: 'success',
    title: 'Julkaisu onnistui'
  })

  const newViewAlerts = R.append(alert, state.view.alerts)
  const stateWithAlert = R.assocPath(['view', 'alerts'], newViewAlerts, state)

  // Update view
  fetchNotifications()
  fetchTimeline(currentMonth, currentYear)

  // Only toggle editor if user hasn't closed it already
  return toggleEditor(stateWithAlert)
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

// NOTIFICATIONS

function toggleUnpublishedNotifications (state, releaseId) {
  console.log('Toggling unpublished notifications')

  const body = document.body

  if (state.unpublishedNotifications.isVisible) {
    body.classList.remove('overflow-hidden')
  } else {
    body.classList.add('overflow-hidden')
  }

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

// TIMELINE

function getCurrentMonth () {
  const currentDate = new Date()

  // getUTCMonth returns 0-11, add 1 to get the proper month
  return currentDate.getUTCMonth() + 1
}

function getCurrentYear () {
  const currentDate = new Date()

  return currentDate.getUTCFullYear()
}

/*
  Returns an object with manipulated month and year
  Manipulation is done with Moment.js: http://momentjs.com/docs/#/manipulating/
 */
function getManipulatedMonthAndYear (options) {
  const {
    month,
    year,
    action,
    amount
  } = options

  /*
    Example, subtract 1 month from January 2017 = December 2016
    moment('1.2017', 'M.YYYY')['subtract'](1, 'months')
  */
  const newDate = moment(`${month}.${year}`, 'M.YYYY')[action](amount, 'months')

  return {
    month: newDate.format('M'),
    year: newDate.format('YYYY')
  }
}

function getPreloadedMonth (state) {
  console.log('Get preloaded month')

  const timeline = state.timeline
  const newItems = R.concat(timeline.preloadedItems, timeline.items)
  const newState = R.assocPath(['timeline', 'direction'], 'up', state)
  const stateWithoutPreloadedItems = R.assocPath(['timeline', 'preloadedItems'], [], newState)

  return R.assocPath(['timeline', 'items'], newItems, stateWithoutPreloadedItems)
}

// Check if month is same as newMonth
function isSameMonth (month, newMonth) {
  console.log(month, newMonth)

  return month.month === parseInt(newMonth.month) &&
    month.year === parseInt(newMonth.year)
}

function getPreviousMonth (state) {
  // Check if previous month is already being fetched
  if (state.timeline.isLoadingPrevious) {
    return state
  }

  const timeline = state.timeline
  const firstMonth = R.head(timeline.items)

  const previousMonthAndYear = getManipulatedMonthAndYear({
    month: firstMonth.month,
    year: firstMonth.year,
    action: 'subtract',
    amount: 1
  })

  console.log('Get previous month', previousMonthAndYear.month, previousMonthAndYear.year)

  fetchTimeline(previousMonthAndYear)

  return R.assocPath(['timeline', 'isLoadingPrevious'], true, state)
}

function getNextMonth (state) {
  // Check if next month is already being fetched
  if (state.timeline.isLoadingNext) {
    return state
  }

  const timeline = state.timeline
  const lastMonth = R.last(timeline.items)

  const nextMonthAndYear = getManipulatedMonthAndYear({
    month: lastMonth.month,
    year: lastMonth.year,
    action: 'add',
    amount: 1
  })

  console.log('Get next month', nextMonthAndYear.month, nextMonthAndYear.year)

  fetchTimeline(nextMonthAndYear)

  return R.assocPath(['timeline', 'isLoadingNext'], true, state)
}

export function initAppState () {
  function onUserReceived (state, response) {
    console.log('Received user')

    const month = getCurrentMonth()
    const year = getCurrentYear()

    fetchNotifications()
    fetchTags()
    fetchTimeline({
      month,
      year
    })

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
    view: {
      categories: [],
      startDate: '',
      endDate: '',
      selectedTab: 'notifications',
      alerts: [],
      isMobileMenuVisible: false
    },
    releases: [],
    notifications: {
      items: [],
      expanded: [],
      tags: [],
      tagsLoading: true,
      selectedTags: [],
      isLoading: false,
      isInitialLoad: true
    },
    unpublishedNotifications: {
      isVisible: false,
      items: testData.unpublishedReleases.map(r => r.notification)
    },
    timeline: {
      items: [],
      preloadedItems: [],
      count: 0,
      dateFormat: 'M.YYYY',
      isLoadingNext: false,
      isLoadingPrevious: false,
      isInitialLoad: true,
      hasLoadingFailed: false
    },
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
    [dispatcher.stream(events.view.update)], view.update,
    [dispatcher.stream(events.view.toggleCategory)], view.toggleCategory,
    [dispatcher.stream(events.view.toggleTab)], view.toggleTab,
    [dispatcher.stream(events.view.removeAlert)], view.removeAlert,
    [dispatcher.stream(events.view.toggleMenu)], view.toggleMenu,

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

    // Notifications
    [dispatcher.stream(events.toggleUnpublishedNotifications)], toggleUnpublishedNotifications,
    [dispatcher.stream(events.getNotifications)], getNotifications,
    [dispatcher.stream(events.lazyLoadNotifications)], lazyLoadNotifications,
    [dispatcher.stream(events.updateSearch)], updateSearch,
    [dispatcher.stream(events.toggleNotificationTag)], toggleNotificationTag,
    [dispatcher.stream(events.setSelectedNotificationTags)], setSelectedNotificationTags,
    [dispatcher.stream(events.toggleNotification)], toggleNotification,

    // Timeline
    [dispatcher.stream(events.getPreloadedMonth)], getPreloadedMonth,
    [dispatcher.stream(events.getPreviousMonth)], getPreviousMonth,
    [dispatcher.stream(events.getNextMonth)], getNextMonth,

    // [userS], onUserReceived,
    [failedNotificationsBus], onNotificationsFailed,
    // [releasesS], onReleasesReceived,
    [timelineBus], onTimelineReceived,
    [failedTimelineBus], onTimelineFailed,
    [tagsBus], onTagsReceived,
    [notificationsBus], onNotificationsReceived,
    [failedTagsBus], onTagsFailed,
    [savedReleases], onSaveComplete,
    [failedReleases], onSaveFailed,
    [alertsBus], onAlertsReceived
  )
}
