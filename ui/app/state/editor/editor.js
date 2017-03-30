import R from 'ramda'
import Bacon from 'baconjs'
import moment from 'moment'

import editNotification from './editNotification'
import editTimeline from './editTimeline'
import targeting from './targeting'
import view from '../view'
import unpublishedNotifications from '../unpublishedNotifications'
import notifications from '../notifications'
import timeline from '../timeline'
import getData from '../../utils/getData'
import createAlert from '../../utils/createAlert'

import urls from '../../data/virkailijan-tyopoyta-urls.json'

const saveBus = new Bacon.Bus()
const saveFailedBus = new Bacon.Bus()
const fetchReleaseBus = new Bacon.Bus()
const fetchReleaseFailedBus = new Bacon.Bus()
const alertsBus = new Bacon.Bus()
const autoSaveBus = new Bacon.Bus()

function getRelease (id) {
  getData({
    // TODO: Change URL
    // url: `${urls.release}/${id}`,
    url: urls.release,
    method: 'GET',
    searchParams: { id },
    onSuccess: release => fetchReleaseBus.push(release, id),
    onError: error => fetchReleaseFailedBus.push(error)
  })
}

function onReleaseReceived (state, response) {
  console.log('Received release')

  // TODO: Remove from production
  response.userGroups = response.userGroups || []

  const release = R.compose(
    R.assocPath(['notification', 'validationState'], response.notification ? 'complete' : 'empty'),
    R.assoc('notification', response.notification || editNotification.emptyNotification()),
    R.assoc('validationState', 'complete')
  )(response)

  /*
    Check if the requested release is the same as received,
    as multiple requests for releases may be running at the same time
  */
  if (response.id === state.editor.requestedReleaseId) {
    return R.compose(
      R.assocPath(['editor', 'isLoadingRelease'], false),
      R.assocPath(['editor', 'editedRelease'], release)
    )(state)
  } else {
    return state
  }
}

function onFetchReleaseFailed (state, response) {
  console.log('Fetching release failed')

  const alert = createAlert({
    type: 'error',
    titleKey: 'julkaisunhakuepaonnistui',
    textKey: 'suljejaavaaeditori'
  })

  onAlertsReceived(state, alert)

  return R.compose(
    R.assocPath(['editor', 'isLoadingRelease'], false),
    R.assocPath(['editor', 'editedRelease'], emptyRelease())
  )(state)
}

function onAlertsReceived (state, alert) {
  const newViewAlerts = R.append(alert, state.editor.alerts)

  return R.assocPath(['editor', 'alerts'], newViewAlerts, state)
}

function onSaveComplete (state) {
  console.log('Release saved')

  const alert = createAlert({
    type: 'success',
    titleKey: 'julkaisuonnistui'
  })

  const month = moment().format('M')
  const year = moment().format('YYYY')

  const newViewAlerts = R.append(alert, state.view.alerts)
  const newState = R.compose(
    R.assocPath(['view', 'alerts'], newViewAlerts),
    R.assoc('view', view.emptyView()),
    R.assoc('unpublishedNotifications', unpublishedNotifications.reset()),
    R.assoc('notifications', notifications.reset(1)),
    R.assoc('timeline', timeline.emptyTimeline()),
    R.assoc('draft', null)
  )(state)

  window.localStorage.removeItem(state.draftKey)

  timeline.fetch({
    month,
    year
  })

  return close(newState)
}

function onSaveFailed (state) {
  console.log('Saving release failed')

  return R.compose(
    R.assocPath(['editor', 'hasSaveFailed'], true),
    R.assocPath(['editor', 'isSavingRelease'], false)
  )(state)
}

function onAutoSave (state) {
  return saveDraft(state)
}

function toggleValue (value, values) {
  let newValues

  R.contains(value, values)
    ? newValues = R.reject(val => val === value, values)
    : newValues = R.concat(values, value)

  return newValues
}

function cleanTimeline (timeline) {
  return timeline
    .filter(item => item.date != null)
    .map(item => R.assoc('content', R.pickBy(content => content.text !== '', item.content), item))
}

function cleanNotification (notification) {
  return notification.validationState === 'complete'
    ? R.assoc(
      'content',
      R.pickBy(content => (content.text !== '' && content.title !== ''), notification.content),
      notification
    )
    : null
}

function cleanUpRelease (release) {
  return R.compose(
    R.assoc('timeline', cleanTimeline(release.timeline)),
    R.assoc('notification', cleanNotification(release.notification))
  )(release)
}

function editReleaseProperties (key, value) {
  // Remove validationState and selectedTargetingGroup
  if (key === 'validationState' || key === 'selectedTargetingGroup') {
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

  // Display correct tab on opening
  const newState = toggleTab(state, selectedTab)

  clearInterval(state.editor.autoSave)

  if (releaseId > -1) {
    console.log('Opening editor with release id', releaseId)

    getRelease(releaseId)

    // Set eventTargetId to focus on the element which was clicked to open the editor on closing
    return R.compose(
      R.assocPath(['editor', 'requestedReleaseId'], releaseId),
      R.assocPath(['editor', 'isVisible'], true),
      R.assocPath(['editor', 'isLoadingRelease'], true),
      R.assocPath(['editor', 'eventTargetId'], eventTargetId)
    )(newState)
  } else {
    console.log('Opening editor, start autosave')

    return R.compose(
      R.assocPath(['editor', 'autoSave'], createAutosaveInterval()),
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

  // Focus on the element which was clicked to open the editor
  if (eventTargetId) {
    document.querySelector(state.editor.eventTargetId).focus()
  }

  return R.assoc('editor', emptyEditor(), state)
}

function editDraft (state, eventTargetId) {
  console.log('Editing draft, start autosave')

  // Hide page scrollbar
  document.body.classList.add('overflow-hidden')

  clearInterval(state.editor.autoSave)

  return R.compose(
    R.assocPath(['editor', 'autoSave'], createAutosaveInterval()),
    R.assocPath(['editor', 'isVisible'], true),
    R.assocPath(['editor', 'eventTargetId'], eventTargetId),
    R.assocPath(['editor', 'editedRelease'], state.draft)
  )(state)
}

function createAutosaveInterval () {
  // 5 minutes
  const interval = 60000 * 5

  return setInterval(() => {
    autoSaveBus.push('saved')
  }, interval)
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
    notification: editNotification.emptyNotification(),
    timeline: [editTimeline.newItem(-1, [])],
    categories: [],
    userGroups: [],
    targetingGroup: null,
    selectedTargetingGroup: null,
    validationState: 'empty'
  }
}

function emptyEditor () {
  return {
    requestedReleaseId: null,
    alerts: [],
    editedRelease: emptyRelease(),
    selectedTab: 'edit-notification',
    eventTargetId: '',
    autoSave: null,
    isVisible: false,
    isPreviewed: false,
    isLoadingRelease: false,
    isSavingRelease: false,
    hasSaveFailed: false
  }
}

function save (state, id) {
  console.log('Saving release')

  // POST for new releases, PUT for updating
  const method = id === -1
    ? 'POST'
    : 'PUT'

  // Remove all tags and set sendEmail as false if notification is empty
  const savedRelease = state.editor.editedRelease.notification.validationState === 'empty'
    ? R.compose(
      R.assocPath(['notification', 'tags'], []),
      R.assoc('sendEmail', false)
    )(state.editor.editedRelease)
    : state.editor.editedRelease

  getData({
    url: urls.release,
    requestOptions: {
      method: method,
      dataType: 'json',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(
        cleanUpRelease(savedRelease),
        editReleaseProperties
      )
    },
    onSuccess: response => saveBus.push(response),
    onError: error => saveFailedBus.push(error)
  })

  return R.assocPath(['editor', 'isSavingRelease'], true, state)
}

function saveDraft (state) {
  const editedRelease = state.editor.editedRelease
  const emptyTimelineItemsCount = R.length(R.filter(item => item.validationState === 'empty', editedRelease.timeline))

  // Only save if the edited release is new (has id of -1) and has content
  if (editedRelease.id > -1 ||
    (editedRelease.id === -1 &&
    editedRelease.notification.validationState === 'empty' &&
    editedRelease.validationState === 'empty' &&
    emptyTimelineItemsCount === editedRelease.timeline.length)
  ) {
    return state
  }

  // Save draft to localStorage and database
  console.log('Saving draft', editedRelease)

  const draft = JSON.stringify(editedRelease)

  window.localStorage.setItem(state.draftKey, draft)

  getData({
    url: urls.draft,
    requestOptions: {
      method: 'POST',
      dataType: 'json',
      headers: {
        'Content-type': 'application/json'
      },
      body: draft
    }
  })

  return R.assoc('draft', editedRelease, state)
}

// Events for appState
const events = {
  open,
  close,
  editDraft,
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
  autoSaveBus,
  fetchReleaseBus,
  fetchReleaseFailedBus,
  alertsBus,
  events,
  initialState,
  onSaveComplete,
  onSaveFailed,
  onAutoSave,
  onReleaseReceived,
  onFetchReleaseFailed,
  onAlertsReceived,
  open,
  close,
  editDraft,
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
