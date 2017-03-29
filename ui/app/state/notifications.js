import R from 'ramda'
import Bacon from 'baconjs'

import view from './view'
import editor from './editor/editor'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()
const saveCategoriesFailedBus = new Bacon.Bus()
const removeNotificationBus = new Bacon.Bus()

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

  getData({
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

function saveCategories (options) {
  console.log('Saving selected categories', options)

  getData({
    url: urls.user,
    requestOptions: {
      method: 'POST',
      dataType: 'json',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(options)
    },
    onSuccess: () => {},
    onError: error => saveCategoriesFailedBus.push(error)
  })
}

function onNotificationsReceived (state, response) {
  console.log('Received notifications')

  /*
    Response has either an array in 'items' property (a page of notifications)
    or an object (single notification related to a timeline item)
  */

  // Set a property to notification related to timeline item for rendering
  if (!response.items) {
    response.isRelatedToTimelineItem = true
    response.count = 1
  }

  const notifications = state.notifications
  const items = notifications.items
  const newItems = response.items ? items.concat(response.items) : [response]

  return R.compose(
    R.assocPath(['notifications', 'items'], newItems),
    R.assocPath(['notifications', 'count'], response.count),
    R.assocPath(['notifications', 'isLoading'], false)
  )(state)
}

function onFetchNotificationsFailed (state) {
  const alert = createAlert({
    type: 'error',
    titleKey: 'tiedotteidenhakuepaonnistui',
    textKey: 'paivitasivu'
  })

  view.alertsBus.push(alert)

  return R.compose(
    R.assocPath(['notifications', 'isLoading'], false),
    R.assocPath(['notifications', 'hasLoadingFailed'], true)
  )(state)
}

function onNotificationRemoved (state, { result, notification, index }) {
  const alert = createAlert({
    type: 'success',
    titleKey: 'tiedotepoistettu'
  })

  if (result && notification.isRelatedToTimelineItem) {
    fetch({ page: 1 })
    view.alertsBus.push(alert)

    return R.assoc('notifications', emptyNotifications(), state)
  }

  if (result) {
    view.alertsBus.push(alert)

    return R.compose(
      R.assocPath(
        ['notifications', 'items'],
        R.update(index, R.assoc('isRemoved', true, notification), state.notifications.items),
      ),
      R.assocPath(['notifications', 'count'], R.dec(state.notifications.count))
    )(state)
  }

  alert.type = 'error'
  alert.titleKey = 'tiedotteenpoistoepaonnistui'

  view.alertsBus.push(alert)

  return onRemoveNotificationFailed(state, notification, index)
}

function onRemoveNotificationFailed (state, notification, index) {
  return R.assocPath(
    ['notifications', 'items'],
    R.update(index, R.assoc('isRemoving', false, notification), state.notifications.items),
    state
  )
}

function onSaveCategoriesFailed (state) {
  const alert = createAlert({
    type: 'error',
    titleKey: 'kategorioidentallennusepaonnistui',
    textKey: 'valitsekategoriauudestaan'
  })

  view.alertsBus.push(alert)

  return state
}

function reset (page) {
  fetch({ page })

  return emptyNotifications()
}

function getPage (state, page) {
  console.log('Get notifications page', page)

  fetch({ page })

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

  return R.compose(
    R.assocPath(['notifications', 'isLoading'], true),
    R.assocPath(['notifications', 'hasLoadingFailed'], false),
    R.assocPath(['notifications', 'currentPage'], 1),
    R.assocPath(['notifications', 'items'], []),
    R.assocPath(['notifications', 'tags'], []),
    R.assocPath(['notifications', 'categories'], [])
  )(state)
}

function toggleTag (state, id) {
  console.log('Toggled tag with id', id)

  const selectedTags = state.notifications.tags
  const newSelectedTags = R.contains(id, selectedTags)
    ? R.reject(selected => selected === id, selectedTags)
    : R.append(id, selectedTags)

  return setSelectedTags(state, newSelectedTags)
}

function setSelectedTags (state, selected) {
  console.log('Updating selected tags', selected)

  fetch({ page: 1, tags: selected })

  return R.compose(
    R.assocPath(['notifications', 'isLoading'], true),
    R.assocPath(['notifications', 'hasLoadingFailed'], false),
    R.assocPath(['notifications', 'currentPage'], 1),
    R.assocPath(['notifications', 'tags'], selected),
    R.assocPath(['notifications', 'items'], [])
  )(state)
}

function toggleCategory (state, id) {
  console.log('Toggled category with id', id)

  const categories = state.notifications.categories
  const newCategories = R.contains(id, categories)
    ? R.reject(selected => selected === id, categories)
    : R.append(id, categories)

  // TODO: Set proper value for email
  saveCategories({
    email: false,
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

function edit (state, releaseId) {
  console.log('Editing notification with release id ', releaseId)

  return editor.open(state, null, releaseId, 'edit-notification')
}

function remove (state, { notification, index, value }) {
  return R.assocPath(
    ['notifications', 'items'],
    R.update(index, R.assoc('confirmRemove', value, notification), state.notifications.items),
    state
  )
}

function confirmRemove (state, { notification, index }) {
  console.log('Removing notification with id', notification.id)

  const newNotification = R.compose(
    R.assoc('isRemoving', true),
    R.assoc('confirmRemove', false)
  )(notification)

  getData({
    url: `${urls.notifications}/${notification.id}`,
    requestOptions: {
      method: 'DELETE'
    },
    onSuccess: () => removeNotificationBus.push({
      result: true,
      notification,
      index
    }),
    onError: () => removeNotificationBus.push({
      result: false,
      notification,
      index
    })
  })

  return R.assocPath(
    ['notifications', 'items'],
    R.update(index, newNotification, state.notifications.items),
    state
  )
}

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
  removeNotificationBus,
  saveCategoriesFailedBus,
  events,
  initialState,
  fetch,
  reset,
  onNotificationsReceived,
  onFetchNotificationsFailed,
  onNotificationRemoved,
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
