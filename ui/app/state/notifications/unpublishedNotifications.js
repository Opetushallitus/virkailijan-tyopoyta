import R from 'ramda'
import Bacon from 'baconjs'

import editor from '../editor/editor'
import http from '../utils/http'
import createAlert from '../utils/createAlert'
import urls from '../../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching unpublished notifications')

  http({
    url: urls['unpublished.notifications'],
    onSuccess: notifications => fetchBus.push(notifications),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, notifications) {
  console.log('Received unpublished notifications')

  return R.compose(
    R.assocPath(['unpublishedNotifications', 'isLoading'], false),
    R.assocPath(['unpublishedNotifications', 'items'], notifications)
  )(state)
}

function onFetchFailed (state) {
  console.error('Fetching unpublished notifications failed')

  const alert = createAlert({
    variant: 'error',
    titleKey: 'julkaisemattomienhakuepaonnistui',
    textKey: 'suljejaavaadialogi'
  })

  const newAlerts = R.append(alert, state.unpublishedNotifications.alerts)

  return R.compose(
    R.assocPath(['unpublishedNotifications', 'isLoading'], false),
    R.assocPath(['unpublishedNotifications', 'alerts'], newAlerts)
  )(state)
}

function open (state, eventTargetId) {
  console.log('Opening unpublished notifications')

  // Set eventTargetId to focus on the element which was clicked to open the editor on closing
  const newState = R.compose(
    R.assocPath(['unpublishedNotifications', 'eventTargetId'], eventTargetId),
    R.assocPath(['unpublishedNotifications', 'isVisible'], true),
  )(state)

  // Hide page scrollbar
  document.body.classList.remove('overflow-hidden')

  // Only fetch notifications when none exist
  if (state.unpublishedNotifications.items.length === 0) {
    fetch()

    return R.assocPath(['unpublishedNotifications', 'isLoading'], true, newState)
  }

  return newState
}

function close (state) {
  // Focus on element which was clicked to open the modal dialog
  document.querySelector(state.unpublishedNotifications.eventTargetId).focus()

  return R.assoc('unpublishedNotifications', emptyNotifications(), state)
}

function edit (state, releaseId) {
  console.log('Editing unpublished notification with release id ', releaseId)

  const newState = close(state)

  return editor.open(newState, null, releaseId, 'edit-notification')
}

function removeAlert (state, id) {
  console.log('Removing alert with id', id)

  const newAlerts = R.reject(alert => alert.id === id, state.unpublishedNotifications.alerts)

  return R.assocPath(['unpublishedNotifications', 'alerts'], newAlerts, state)
}

function emptyNotifications () {
  return {
    alerts: [],
    items: [],
    eventTargetId: '',
    isLoading: false,
    isVisible: false
  }
}

// Events for appState
const events = {
  open,
  close,
  edit,
  removeAlert
}

const initialState = emptyNotifications()

const notifications = {
  fetchBus,
  fetchFailedBus,
  events,
  initialState,
  fetch,
  onReceived,
  onFetchFailed,
  open,
  close,
  edit,
  removeAlert
}

export default notifications
