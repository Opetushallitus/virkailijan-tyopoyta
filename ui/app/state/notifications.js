import R from 'ramda'
import Bacon from 'baconjs'

import view from './view'
import editor from './editor/editor'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'

const url = '/virkailijan-tyopoyta/api/notifications'

const bus = new Bacon.Bus()
const failedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching releases')

  getData({
    url: url,
    onSuccess: notifications => bus.push(notifications),
    onError: error => failedBus.push(error)
  })
}

function onReceived (state, response) {
  console.log('Received notifications')

  const newState = R.assocPath(['notifications', 'isInitialLoad'], false, state)
  const stateWithoutLoading = R.assocPath(['notifications', 'isLoading'], false, newState)

  return R.assocPath(['notifications', 'items'], response, stateWithoutLoading)
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

function getPage (state, value) {
  console.log('Get notifications from page')

  return R.assoc('isLoading', value.isLoading, state)
}

function updateSearch (state, search) {
  return R.assoc('filter', search, state)
}

function toggleTag (state, value) {
  console.log('Toggled tag with value', value)

  const isSelected = state.notifications.selectedTags.indexOf(value) >= 0
  let newTags = []

  // Remove an already selected tag
  if (isSelected) {
    newTags = state.notifications.selectedTags.filter(tag => (tag !== value))
  } else {
    // Set tag to state if not selected
    newTags = state.notifications.selectedTags.concat(value)
  }

  return setSelectedTags(state, newTags)
}

function setSelectedTags (state, value) {
  console.log('Updating selected notification tags', value)

  return R.assocPath(
    ['notifications', 'selectedTags'],
    value,
    state
  )
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

// Events for appState
const events = {
  getPage,
  updateSearch,
  toggleTag,
  setSelectedTags,
  toggle,
  edit,
  toggleUnpublishedNotifications
}

const initialState = {
  items: [],
  expanded: [],
  tags: [],
  tagsLoading: true,
  selectedTags: [],
  isLoading: false,
  isInitialLoad: true
}

const notifications = {
  bus,
  failedBus,
  events,
  initialState,
  fetch,
  onReceived,
  onFailed,
  getPage,
  updateSearch,
  toggleTag,
  setSelectedTags,
  toggle,
  edit,
  toggleUnpublishedNotifications
}

export default notifications
