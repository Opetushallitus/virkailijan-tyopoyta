import R from 'ramda'
import Bacon from 'baconjs'

import view from './view'
import editor from './editor/editor'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'

const url = '/virkailijan-tyopoyta/api/notifications'
const saveCategoriesUrl = '/virkailijan-tyopoyta/api/user'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

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

  // TODO: Using /api/release to get a notification by id for now, remove when /api/notifications takes an id as parameter
  getData({
    url: id ? '/virkailijan-tyopoyta/api/release' : url,
    searchParams: {
      page,
      id,
      tags,
      categories
    },
    onSuccess: notifications => fetchBus.push(notifications),
    onError: error => fetchFailedBus.push(error)
  })
}

function saveCategories (categories) {
  getData({
    url: saveCategoriesUrl,
    searchParams: {
      categories: categories ? categories.join(',') : []
    },
    onSuccess: () => {},
    onError: error => { console.log(error) }
  })
}

function reset (page) {
  fetch({ page })

  return emptyNotifications()
}

function onReceived (state, response) {
  console.log('Received notifications')

  // Response is either an array (page of notifications) or an object (single notification related to a timeline item)

  // Set a property to notification related to timeline item for rendering
  if (!R.isArrayLike(response)) {
    response.notification.isRelatedToTimelineItem = true
  }

  const notifications = state.notifications
  const items = notifications.items
  const newItems = R.isArrayLike(response) ? items.concat(response) : [response.notification]

  return R.compose(
    R.assocPath(['notifications', 'items'], newItems),
    R.assocPath(['notifications', 'isLoading'], false),
    R.assocPath(['notifications', 'isInitialLoad'], false)
  )(state)
}

function onFailed (state) {
  const alert = createAlert({
    type: 'error',
    title: 'Tiedotteiden haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  const newState = R.assocPath(['notifications', 'isInitialLoad'], false, state)
  const stateWithoutLoading = R.assocPath(['notifications', 'isLoading'], false, newState)

  view.alertsBus.push(alert)

  return stateWithoutLoading
}

function getPage (state, page) {
  console.log('Get notifications page', page)

  fetch({ page })

  const newPage = page === 1 ? 1 : state.notifications.currentPage + 1
  const newItems = page === 1 ? [] : state.notifications.items

  return R.compose(
    R.assocPath(['notifications', 'isLoading'], true),
    R.assocPath(['notifications', 'items'], newItems),
    R.assocPath(['notifications', 'currentPage'], newPage)
  )(state)
}

function getNotificationById (state, id) {
  console.log('Get notification with id', id)

  fetch({ id })

  return R.compose(
    R.assocPath(['notifications', 'isLoading'], true),
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
    R.assocPath(['notifications', 'currentPage'], 1),
    R.assocPath(['notifications', 'tags'], selected),
    R.assocPath(['notifications', 'items'], [])
  )(state)
}

function toggleCategory (state, category) {
  const categories = state.notifications.categories
  const newCategories = R.contains(category, categories)
    ? R.reject(selected => selected === category, categories)
    : R.append(category, categories)

  // Save selected categories and get notifications filtered by categories
  saveCategories(categories)

  fetch({
    page: 1,
    tags: state.notifications.tags,
    categories: newCategories
  })

  return R.compose(
    R.assocPath(['notifications', 'isLoading'], true),
    R.assocPath(['notifications', 'currentPage'], 1),
    R.assocPath(['notifications', 'items'], []),
    R.assocPath(['notifications', 'categories'], newCategories)
  )(state)
}

function edit (state, releaseId) {
  console.log('Editing notification with release id ', releaseId)

  return editor.open(state, null, releaseId, 'edit-notification')
}

function emptyNotifications () {
  return {
    items: [],
    currentPage: 1,
    tags: [],
    categories: [],
    isLoading: false,
    isInitialLoad: true
  }
}

// Events for appState
const events = {
  toggleTag,
  setSelectedTags,
  toggleCategory,
  getPage,
  edit
}

const initialState = emptyNotifications()

const notifications = {
  fetchBus,
  fetchFailedBus,
  events,
  initialState,
  fetch,
  reset,
  onReceived,
  onFailed,
  toggleTag,
  setSelectedTags,
  toggleCategory,
  getPage,
  getNotificationById,
  edit
}

export default notifications
