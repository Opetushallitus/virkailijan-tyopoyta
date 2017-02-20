import R from 'ramda'
import Bacon from 'baconjs'

import editor from './editor/editor'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'

const url = '/virkailijan-tyopoyta/api/notifications/unpublished'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching unpublished notifications')

  getData({
    url: url,
    onSuccess: notifications => fetchBus.push(notifications),
    onError: error => fetchFailedBus.push(error)
  })
}

function reset () {
  fetch()

  return emptyState()
}

function onReceived (state, response) {
  console.log('Received unpublished notifications')

  return R.compose(
    R.assocPath(['unpublishedNotifications', 'isLoading'], false),
    R.assocPath(['unpublishedNotifications', 'items'], response)
  )(state)
}

function onFailed (state) {
  const alert = createAlert({
    type: 'error',
    title: 'Julkaisemattomien tiedotteiden haku epäonnistui',
    text: 'Sulje ja avaa dialogi uudestaan hakeaksesi uudelleen'
  })

  const newAlerts = R.append(alert, state.unpublishedNotifications.alerts)

  return R.compose(
    R.assocPath(['unpublishedNotifications', 'isLoading'], false),
    R.assocPath(['unpublishedNotifications', 'alerts'], newAlerts)
  )(state)
}

function toggle (state, releaseId) {
  console.log('Toggling unpublished notifications')

  const body = document.body

  if (state.unpublishedNotifications.isVisible) {
    body.classList.remove('overflow-hidden')
  } else {
    body.classList.add('overflow-hidden')

    // Only fetch notifications when none exist
    if (state.unpublishedNotifications.items.length === 0) {
      fetch()
    }
  }

  return R.compose(
    R.assocPath(['unpublishedNotifications', 'isVisible'], !state.unpublishedNotifications.isVisible),
    R.assocPath(['unpublishedNotifications', 'alerts'], [])
  )(state)
}

function edit (state, id) {
  console.log('Editing unpublished notification with id ', id)

  const newState = R.assocPath(['unpublishedNotifications', 'isVisible'], false, state)

  return editor.toggle(newState, id, 'edit-notification')
}

function removeAlert (state, id) {
  console.log('Removing alert with id', id)

  const newAlerts = R.reject(alert => alert.id === id, state.unpublishedNotifications.alerts)

  return R.assocPath(['unpublishedNotifications', 'alerts'], newAlerts, state)
}

function emptyState () {
  return {
    alerts: [],
    items: [],
    isLoading: false,
    isVisible: false
  }
}

// Events for appState
const events = {
  toggle,
  edit,
  removeAlert
}

const initialState = emptyState()

const notifications = {
  fetchBus,
  fetchFailedBus,
  events,
  initialState,
  fetch,
  reset,
  onReceived,
  onFailed,
  toggle,
  edit,
  removeAlert
}

export default notifications
