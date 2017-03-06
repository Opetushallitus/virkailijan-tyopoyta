import R from 'ramda'
import Bacon from 'baconjs'

import targeting from './targeting'
import editNotification from './editNotification'
import editTimeline from './editTimeline'
import userGroups from '../userGroups'
import view from '../view'
import unpublishedNotifications from '../unpublishedNotifications'
import notifications from '../notifications'
import timeline from '../timeline'
import getData from '../../utils/getData'
import createAlert from '../../utils/createAlert'

const url = '/virkailijan-tyopoyta/api/release'

const saveBus = new Bacon.Bus()
const saveFailedBus = new Bacon.Bus()
const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function getRelease (id) {
  getData({
    url: url,
    method: 'GET',
    searchParams: { id },
    onSuccess: release => { fetchBus.push(release) },
    onError: error => { fetchFailedBus.push(error) }
  })
}

function onReleaseReceived (state, response) {
  console.log('Received release')

  // TODO: Remove from production
  response.userGroups = response.userGroups || []

  return R.compose(
    R.assocPath(['editor', 'isLoading'], false),
    R.assocPath(['editor', 'editedRelease'], response)
  )(state)
}

function onFetchFailed (state, response) {
  console.log('Fetching release failed')

  const alert = createAlert({
    type: 'error',
    title: 'Julkaisun haku epäonnistui',
    text: 'Sulje ja avaa editori uudestaan hakeaksesi uudelleen'
  })

  const newAlerts = R.append(alert, state.editor.alerts)

  return R.compose(
    R.assocPath(['editor', 'isLoading'], false),
    R.assocPath(['editor', 'alerts'], newAlerts),
    R.assocPath(['editor', 'editedRelease'], targeting.emptyRelease())
  )(state)
}

function toggleValue (value, values) {
  let newValues

  R.contains(value, values)
    ? newValues = R.reject(val => val === value, values)
    : newValues = R.concat(values, value)

  return newValues
}

function cleanTimeline (timeline) {
  return timeline.filter(tl => tl.date != null).map(tl =>
    R.assoc('content', R.pickBy(c => c.text !== '', tl.content), tl))
}

function cleanNotification (notification) {
  return notification.validationState === 'complete'
    ? R.assoc('content', R.pickBy(c => (c.text !== '' && c.title !== ''), notification.content), notification)
    : null
}

function cleanUpRelease (release) {
  return R.compose(
    R.assoc('timeline', cleanTimeline(release.timeline)),
    R.assoc('notification', cleanNotification(release.notification))
  )(release)
}

function editReleaseProperties (key, value) {
  // Remove validationState
  if (key === 'validationState') {
    return undefined
  }

  // Set selected user groups to [], if "All user groups" was selected in the editor
  if (key === 'userGroups' && R.contains(-1, value)) {
    return []
  }

  return value
}

function open (state, eventTargetId, releaseId = -1, selectedTab = 'edit-notification') {
  // Hide page scrollbar
  document.body.classList.add('overflow-hidden')

  userGroups.fetch()

  // Display correct tab on opening
  const newState = toggleTab(state, selectedTab)

  if (releaseId > -1) {
    console.log('Opening editor with release id', releaseId)

    getRelease(releaseId)

    // Set eventTargetId to focus on the element which was clicked to open the editor on closing
    return R.compose(
      R.assocPath(['editor', 'isVisible'], true),
      R.assocPath(['editor', 'isLoading'], true),
      R.assocPath(['editor', 'eventTargetId'], eventTargetId)
    )(newState)
  } else {
    console.log('Opening editor')

    return R.compose(
      R.assocPath(['editor', 'isVisible'], true),
      R.assocPath(['editor', 'eventTargetId'], eventTargetId)
    )(newState)
  }
}

function close (state) {
  console.log('Closing editor')

  const eventTargetId = state.editor.eventTargetId

  // Display page scrollbar
  document.body.classList.remove('overflow-hidden')

  // Focus on element which was clicked to open the editor
  if (eventTargetId) {
    document.querySelector(state.editor.eventTargetId).focus()
  }

  return R.assoc('editor', emptyEditor(), state)
}

function removeAlert (state, id) {
  console.log('Removing alert with id', id)

  const newAlerts = R.reject(alert => alert.id === id, state.editor.alerts)

  return R.assocPath(['editor', 'alerts'], newAlerts, state)
}

function toggleTab (state, selectedTab) {
  console.log('Toggling editor tab', selectedTab)

  return R.assocPath(['editor', 'selectedTab'], selectedTab, state)
}

function togglePreview (state, isPreviewed) {
  console.log('Toggling document preview', isPreviewed)

  return R.assocPath(['editor', 'isPreviewed'], isPreviewed, state)
}

function toggleHasSaveFailed (state, hasSaveFailed) {
  return R.assocPath(['editor', 'hasSaveFailed'], !state.editor.hasSaveFailed, state)
}

function emptyRelease () {
  return {
    id: -1,
    sendEmail: false,
    notification: editNotification.emptyNotification(),
    timeline: [editTimeline.newItem(-1, [])],
    categories: [],
    userGroups: [],
    validationState: 'empty'
  }
}

function emptyEditor () {
  return {
    isVisible: false,
    isPreviewed: false,
    isLoading: false,
    hasSaveFailed: false,
    alerts: [],
    editedRelease: emptyRelease(),
    selectedTab: 'edit-notification',
    eventTargetId: ''
  }
}

function save (state, id) {
  console.log('Saving release')

  // POST for new releases, PUT for updating
  // const method = id === -1
  //   ? 'POST'
  //   : 'PUT'

  getData({
    url: url,
    requestOptions: {
      method: 'POST',
      dataType: 'json',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(
        cleanUpRelease(state.editor.editedRelease),
        editReleaseProperties
      )
    },
    onSuccess: json => saveBus.push(json),
    onError: error => saveFailedBus.push(error)
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
  const newState = R.compose(
    R.assocPath(['view', 'alerts'], newViewAlerts),
    R.assoc('view', view.emptyView()),
    R.assoc('unpublishedNotifications', unpublishedNotifications.reset()),
    R.assoc('notifications', notifications.reset(1)),
    R.assoc('timeline', timeline.emptyTimeline())
  )(state)

  return close(newState)
}

function onSaveFailed (state) {
  console.log('Saving release failed')

  const newState = R.assocPath(['editor', 'isLoading'], false, state)

  return R.assocPath(['editor', 'hasSaveFailed'], true, newState)
}

function saveDraft (state) {
  console.log('Saving draft', state.editor.editedRelease)

  // Only save if publishing state === draft

  const draft = JSON.stringify(state.editor.editedRelease)

  return state
}

// Events for appState
const events = {
  open,
  close,
  toggleTab,
  togglePreview,
  toggleHasSaveFailed,
  removeAlert,
  save,
  saveDraft,
  targeting: targeting.events,
  editNotification: editNotification.events,
  editTimeline: editTimeline.events
}

const initialState = emptyEditor()

const editor = {
  saveBus,
  saveFailedBus,
  fetchBus,
  fetchFailedBus,
  events,
  initialState,
  onSaveComplete,
  onSaveFailed,
  onReleaseReceived,
  onFetchFailed,
  open,
  close,
  toggleTab,
  togglePreview,
  toggleHasSaveFailed,
  toggleValue,
  removeAlert,
  save,
  saveDraft,
  targeting,
  editNotification,
  editTimeline
}

export default editor
