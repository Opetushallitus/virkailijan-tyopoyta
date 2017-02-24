import R from 'ramda'
import Bacon from 'baconjs'

import view from './view'
import editor from './editor/editor'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'

const url = '/virkailijan-tyopoyta/api/notifications'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch (page) {
  console.log('Fetching notifications')

  if (!page) {
    console.error('No page given for fetching notifications')
    return
  }

  getData({
    url: url,
    searchParams: {
      page: page
    },
    onSuccess: notifications => fetchBus.push(notifications),
    onError: error => fetchFailedBus.push(error)
  })
}

function reset () {
  fetch(1)

  return emptyNotifications()
}

function onReceived (state, response) {
  console.log('Received notifications')

  const notifications = state.notifications
  const items = notifications.items
  const newItems = items.concat(response)
  const page = notifications.currentPage

  // Only increment page after initial load
  const newPage = notifications.isInitialLoad ? 1 : page + 1

  // Result is an empty array = no more notifications
  const hasPagesLeft = response.length > 0

  return R.compose(
    R.assocPath(['notifications', 'currentPage'], newPage),
    R.assocPath(['notifications', 'items'], newItems),
    R.assocPath(['notifications', 'hasPagesLeft'], hasPagesLeft),
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

  fetch(page)

  return R.assocPath(['notifications', 'isLoading'], true, state)
}

function updateSearch (state, search) {
  return R.assoc('filter', search, state)
}

// Expand/contract notification
function toggle (state, id) {
  console.log('Toggling notification', id)

  const index = state.notifications.expanded.indexOf(id)

  const newState = index >= 0
    ? R.remove(index, 1, state.notifications.expanded)
    : R.append(id, state.notifications.expanded)

  return R.assocPath(['notifications', 'expanded'], newState, state)
}

function edit (state, id) {
  console.log('Editing notification with id ', id)

  return editor.toggle(state, id, 'edit-notification')
}

function emptyNotifications () {
  return {
    items: [],
    expanded: [],
    currentPage: 1,
    hasPagesLeft: true,
    isLoading: false,
    isInitialLoad: true
  }
}

// Events for appState
const events = {
  updateSearch,
  getPage,
  toggle,
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
  updateSearch,
  getPage,
  toggle,
  edit
}

export default notifications
