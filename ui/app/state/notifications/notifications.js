import R from 'ramda'
import Bacon from 'baconjs'
import moment from 'moment'

import view from '../view'
import timeline from '../timeline'
import editor from '../editor/editor'
import http from '../utils/http'
import toggleValue from '../utils/toggleValue'
import createAlert from '../utils/createAlert'
import urls from '../../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()
const saveCategoriesFailedBus = new Bacon.Bus()
const releaseRemovedBus = new Bacon.Bus()
const removeReleaseFailedBus = new Bacon.Bus()

// GET requests

function fetch (options) {
  console.log('Fetching notifications')

  const {
    page = '',
    id = '',
    tags = tags ? tags.join('') : [],
    categories = categories ? categories.join(',') : []
  } = options

  if (!page && !id) {
    console.error('No page or id given for fetching notifications')
    return
  }

  http({
    url: id ? `${urls.notifications}/${id}` : urls.notifications,
    searchParams: {
      page,
      tags,
      categories
    },
    onSuccess: notifications => fetchBus.push(notifications),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, notifications) {
  console.log('Received notifications')

  /*
   Response has either an array in 'items' property (a page of notifications)
   or an object (single notification related to a timeline item)
   */

  // Set a property to notification related to timeline item for rendering
  if (!notifications.items) {
    notifications.isRelatedToTimelineItem = true
    notifications.count = 1
  }

  const newItems = notifications.items ? state.notifications.items.concat(notifications.items) : [notifications]

  return R.compose(
    R.assocPath(['notifications', 'items'], newItems),
    R.assocPath(['notifications', 'count'], notifications.count),
    R.assocPath(['notifications', 'isLoading'], false)
  )(state)
}

function onFetchFailed (state) {
  const alert = createAlert({
    variant: 'error',
    titleKey: 'tiedotteidenhakuepaonnistui',
    textKey: 'paivitasivu'
  })

  view.alertsBus.push(alert)

  return R.compose(
    R.assocPath(['notifications', 'isLoading'], false),
    R.assocPath(['notifications', 'hasLoadingFailed'], true)
  )(state)
}

function getPage (state, page) {
  console.log('Get notifications page', page)

  fetch({ page })

  // Reset page and clear notifications when fetching the first page
  const newPage = page === 1 ? 1 : state.notifications.currentPage + 1
  const newItems = page === 1 ? [] : state.notifications.items

  return R.compose(
    R.assocPath(['notifications', 'isLoading'], true),
    R.assocPath(['notifications', 'hasLoadingFailed'], false),
    R.assocPath(['notifications', 'items'], newItems),
    R.assocPath(['notifications', 'currentPage'], newPage)
  )(state)
}

function getNotificationById (state, id) {
  console.log('Get notification with id', id)

  fetch({ id })

  /*
    Reset selected tags and categories when fetching a specific notification (e.g. notification related to
    a timeline item)
  */
  return R.compose(
    R.assocPath(['notifications', 'isLoading'], true),
    R.assocPath(['notifications', 'hasLoadingFailed'], false),
    R.assocPath(['notifications', 'currentPage'], 1),
    R.assocPath(['notifications', 'items'], []),
    R.assocPath(['notifications', 'tags'], []),
    R.assocPath(['notifications', 'categories'], [])
  )(state)
}

function edit (state, releaseId) {
  console.log('Editing notification with release id ', releaseId)

  return editor.open(state, null, releaseId, 'edit-notification')
}

// POST requests

function saveCategories (options) {
  console.log('Saving selected categories', options)

  http({
    url: urls.user,
    requestOptions: {
      method: 'POST',
      dataType: 'json',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(options)
    },
    onError: error => saveCategoriesFailedBus.push(error)
  })
}

function onSaveCategoriesFailed (state) {
  console.error('Saving categories failed')

  const alert = createAlert({
    variant: 'error',
    titleKey: 'kategorioidentallennusepaonnistui',
    textKey: 'valitsekategoriauudestaan'
  })

  view.alertsBus.push(alert)

  return state
}

// DELETE requests

function confirmRemove (state, { notification, index }) {
  console.log('Removing release with id', notification.releaseId)

  // Set path depending if the removed notification has a variant (e.g. a disruption notification)
  const path = notification.variant
    ? [`${notification.variant}Notifications`, 'items']
    : ['notifications', 'items']

  const newNotification = R.compose(
    R.assoc('isRemoving', true),
    R.assoc('confirmRemove', false)
  )(notification)

  http({
    url: `${urls.release}/${notification.releaseId}`,
    requestOptions: {
      method: 'DELETE'
    },
    onSuccess: () => releaseRemovedBus.push({ notification, index }),
    onError: () => removeReleaseFailedBus.push({ notification, index })
  })

  return R.assocPath(
    path,
    R.update(index, newNotification, R.path(path, state)),
    state
  )
}

function onReleaseRemoved (state, { notification, index }) {
  console.log('Release removed')

  const month = moment().format('M')
  const year = moment().format('YYYY')

  const alert = createAlert({
    variant: 'success',
    titleKey: 'tiedotejatapahtumapoistettu'
  })

  view.alertsBus.push(alert)

  // Set path and new count depending if the removed notification had a variant (e.g. a disruption notification)
  const prop = notification.variant ? 'notifications' : `${notification.variant}Notifications`

  const path = notification.variant
    ? [`${notification.variant}Notifications`, 'items']
    : ['notifications', 'items']

  const newCount = notification.variant
    ? R.path(['notifications', 'count'], state)
    : R.dec(R.path(['notifications', 'count'], state))

  // Get first page if notification was related to a timeline item (the notification is the only item on the list)
  if (notification.isRelatedToTimelineItem) {
    fetch({ page: 1 })

    return R.assoc(prop, emptyNotifications(), state)
  }

  // Reset timeline and remove notification
  return R.compose(
    R.assoc('timeline', timeline.initialState),
    R.assocPath(
      path,
      R.update(index, R.assoc('isRemoved', true, notification), R.path(path, state)),
    ),
    R.assocPath(['notifications', 'count'], newCount)
  )(state)
}

function onRemoveReleaseFailed (state, { notification, index }) {
  console.error('Remove release failed')

  const path = notification.variant
    ? [`${notification.variant}Notifications`, 'items']
    : ['notifications', 'items']

  const alert = createAlert({
    variant: 'error',
    titleKey: 'tiedotteenjatapahtumanpoistoepaonnistui'
  })

  view.alertsBus.push(alert)

  return R.assocPath(
    path,
    R.update(index, R.assoc('isRemoving', false, notification), R.path(path, state)),
    state
  )
}

// Updating state

function toggleTag (state, id) {
  console.log('Toggled tag with id', id)

  return setSelectedTags(state, toggleValue(id, state.notifications.tags))
}

function setSelectedTags (state, tags) {
  console.log('Updating selected tags', tags)

  fetch({
    page: 1,
    tags,
    categories: state.notifications.categories
  })

  return R.compose(
    R.assocPath(['notifications', 'isLoading'], true),
    R.assocPath(['notifications', 'hasLoadingFailed'], false),
    R.assocPath(['notifications', 'currentPage'], 1),
    R.assocPath(['notifications', 'tags'], tags),
    R.assocPath(['notifications', 'items'], [])
  )(state)
}

function toggleCategory (state, id) {
  console.log('Toggled category with id', id)

  const categories = state.notifications.categories
  const newCategories = R.contains(id, categories)
    ? R.reject(selected => selected === id, categories)
    : R.append(id, categories)

  saveCategories({
    categories: newCategories
  })

  fetch({
    page: 1,
    tags: state.notifications.tags,
    categories: newCategories
  })

  return R.compose(
    R.assocPath(['notifications', 'isLoading'], true),
    R.assocPath(['notifications', 'hasLoadingFailed'], false),
    R.assocPath(['notifications', 'currentPage'], 1),
    R.assocPath(['notifications', 'items'], []),
    R.assocPath(['notifications', 'categories'], newCategories)
  )(state)
}

function remove (state, { notification, index, value }) {
  const path = notification.variant
    ? [`${notification.variant}Notifications`, 'items']
    : ['notifications', 'items']

  return R.assocPath(
    path,
    R.update(index, R.assoc('confirmRemove', value, notification), R.path(path, state)),
    state
  )
}

// Initial state

function emptyNotifications () {
  return {
    items: [],
    currentPage: 1,
    tags: [],
    categories: [],
    isLoading: true,
    hasLoadingFailed: false
  }
}

// Events for appState
const events = {
  toggleTag,
  setSelectedTags,
  toggleCategory,
  getPage,
  edit,
  remove,
  confirmRemove
}

const initialState = emptyNotifications()

const notifications = {
  fetchBus,
  fetchFailedBus,
  releaseRemovedBus,
  removeReleaseFailedBus,
  saveCategoriesFailedBus,
  events,
  initialState,
  fetch,
  onReceived,
  onFetchFailed,
  onReleaseRemoved,
  onRemoveReleaseFailed,
  onSaveCategoriesFailed,
  toggleTag,
  setSelectedTags,
  toggleCategory,
  getPage,
  getNotificationById,
  edit,
  remove,
  confirmRemove
}

export default notifications
