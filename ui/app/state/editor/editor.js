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

function cleanUpDocument (document) {
  return R.compose(
    R.assoc('timeline', cleanTimeline(document.timeline)),
    R.assoc('notification', cleanNotification(document.notification))
  )(document)
}

function editDocumentProperties (key, value) {
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

function toggle (state, releaseId = -1, selectedTab) {
  document.body.classList.add('overflow-hidden')

  // Reset editor when closing
  if (state.editor.isVisible) {
    console.log('Closing editor')

    document.body.classList.remove('overflow-hidden')

    return R.assoc('editor', emptyEditor(), state)
  } else if (releaseId > -1) {
    // Display correct tab depending if user edits a notification or a timeline item
    console.log('Toggling editor with release id', releaseId)

    const newState = toggleTab(state, selectedTab)

    getRelease(releaseId)
    userGroups.fetch()

    return R.assocPath(['editor', 'isVisible'], true, newState)
  } else {
  // Display notification tab when creating a new release
    const newState = toggleTab(state, 'edit-notification')

    userGroups.fetch()

    return R.compose(
      R.assocPath(['editor', 'isVisible'], true),
      R.assocPath(['editor', 'isLoading'], false)
    )(newState)
  }
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
    isLoading: true,
    hasSaveFailed: false,
    alerts: [],
    editedRelease: emptyRelease(),
    selectedTab: 'edit-notification'
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
      body: JSON.stringify(cleanUpDocument(state.editor.editedRelease), editDocumentProperties)
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

  document.body.classList.remove('overflow-hidden')

  return R.compose(
    R.assoc('editor', emptyEditor()),
    R.assocPath(['view', 'alerts'], newViewAlerts),
    R.assoc('view', view.emptyView()),
    R.assoc('unpublishedNotifications', unpublishedNotifications.reset()),
    R.assoc('notifications', notifications.reset()),
    R.assoc('timeline', timeline.emptyTimeline())
  )(state)
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
  toggle,
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
  toggle,
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
