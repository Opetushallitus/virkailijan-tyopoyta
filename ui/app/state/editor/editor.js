import R from 'ramda'
import Bacon from 'baconjs'

import editNotification from './editNotification'
import editTimeline from './editTimeline'
import targeting from './targeting'
import targetingGroups from '../targetingGroups'
import view from '../view'
import unpublishedNotifications from '../notifications/unpublishedNotifications'
import specialNotifications from '../notifications/specialNotifications'
import notifications from '../notifications/notifications'
import timeline from '../timeline'
import http from '../utils/http'
import createAlert from '../utils/createAlert'

import urls from '../../data/virkailijan-tyopoyta-urls.json'

const fetchReleaseBus = new Bacon.Bus()
const fetchReleaseFailedBus = new Bacon.Bus()
const saveBus = new Bacon.Bus()
const saveFailedBus = new Bacon.Bus()
const sendEmailBus = new Bacon.Bus()
const sendEmailFailedBus = new Bacon.Bus()
const saveTargetingGroupBus = new Bacon.Bus()
const alertsBus = new Bacon.Bus()
const autoSaveBus = new Bacon.Bus()

// GET requests and callbacks

function getRelease (id) {
  console.log('Fetching release with id', id)

  http({
    url: `${urls.release}/${id}`,
    onSuccess: release => fetchReleaseBus.push(release, id),
    onError: error => fetchReleaseFailedBus.push(error)
  })
}

function onReleaseReceived (state, release) {
  console.log('Received release')

  // Add content.sv to all timeline items if missing
  R.forEach(item => (item.content.sv = item.content.sv || editTimeline.emptyContent(item.id, 'sv')), release.timeline)

  /*
   Add necessary properties to received release:
   - notification's content.sv
   - validationState for notification and release
   - id of -1 to user groups (represents "Target to all user groups" selection), if response has none
    */
  const newRelease = R.compose(
    R.assocPath(
      ['notification', 'content', 'sv'],
      R.path(['notification', 'content', 'sv'], release) || editNotification.emptyContent(-1, 'sv')
    ),
    R.assocPath(['notification', 'validationState'], release.notification ? 'complete' : 'empty'),
    R.assoc('notification', release.notification || editNotification.emptyNotification()),
    release.userGroups.length === 0 ? R.assoc('userGroups', [-1]) : R.assoc('userGroups', release.userGroups),
    R.assoc('validationState', 'complete')
  )(release)

  /*
    Check if the fetched release is the same as received,
    as multiple requests for releases may be pending at the same time
  */
  if (release.id === state.editor.requestedReleaseId) {
    return R.compose(
      R.assocPath(['editor', 'isLoadingRelease'], false),
      R.assocPath(['editor', 'editedRelease'], newRelease)
    )(state)
  } else {
    return state
  }
}

// Display an error alert in the editor if fetching the release fails
function onFetchReleaseFailed (state) {
  console.error('Fetching release failed')

  const alert = createAlert({
    variant: 'error',
    titleKey: 'julkaisunhakuepaonnistui',
    textKey: 'suljejaavaaeditori'
  })

  return R.compose(
    R.assocPath(['editor', 'alerts'], R.append(alert, state.editor.alerts)),
    R.assocPath(['editor', 'isLoadingRelease'], false),
    R.assocPath(['editor', 'editedRelease'], emptyRelease())
  )(state)
}

// POST requests and callbacks

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

  http({
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
    onSuccess: releaseId => saveBus.push({ releaseId, savedRelease }),
    onError: error => {
      console.log("Saving failed");
      console.error(error);
      saveFailedBus.push(error)
    }
  })

  return R.assocPath(['editor', 'isSavingRelease'], true, state)
}

// Remove timeline items with no date and language versions with no text
function cleanTimeline (timeline) {
  return timeline
    .filter(item => item.date !== null)
    .map(item => R.assoc('content', R.pickBy(content => content.text !== '', item.content), item))
}

// Remove notification's language versions with no content
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

  // Set selected user groups to empty array, if "Target to all user groups" was selected in the editor
  if (key === 'userGroups' && R.contains(-1, value)) {
    return []
  }

  return value
}

function onSaveComplete (state, { releaseId, savedRelease }) {
  console.log('Release saved')

  const alert = createAlert({
    variant: 'success',
    titleKey: 'julkaisuonnistui'
  })

  const newViewAlerts = view.setNewAlerts(alert, state.view.alerts)

  // Display page scrollbar
  document.body.classList.remove('overflow-hidden')

  clearInterval(state.editor.autoSave)

  // Remove draft from localStorage if the release is new
  if (savedRelease.id === -1) {
    window.localStorage.removeItem(state.draftKey)
  }

  // Save targeting group
  if (savedRelease.targetingGroup) {
    targetingGroups.save(state, {
      name: savedRelease.targetingGroup,
      categories: savedRelease.categories,
      userGroups: savedRelease.userGroups,
      tags: savedRelease.notification.tags
    })
  }

  // Send email
  if (savedRelease.notification.sendEmail) {
    sendEmail(state, releaseId)
  }

  // Close editor, reset view and remove draft if saved release was new
  notifications.fetch({ page: 1 })
  specialNotifications.fetch()

  return R.compose(
    R.assocPath(['view', 'alerts'], newViewAlerts),
    R.assoc('view', view.initialState),
    R.assoc('unpublishedNotifications', unpublishedNotifications.initialState),
    R.assoc('specialNotifications', specialNotifications.initialState),
    R.assoc('notifications', notifications.initialState),
    R.assoc('timeline', timeline.initialState),
    R.assoc('editor', emptyEditor()),
    savedRelease.id === -1 ? R.assoc('draft', null) : R.assoc('draft', state.draft)
  )(state)
}

function onSaveFailed (state, error) {
  return R.compose(
    R.assocPath(['editor', 'hasSaveFailed'], true),
    R.assocPath(['editor', 'isSavingRelease'], false),
    R.assocPath(['editor', 'saveErrorMessages'], [error.message])
  )(state)
}

function saveDraft (state) {
  const editedRelease = state.editor.editedRelease
  const emptyTimelineItemsCount = R.length(R.filter(item => item.validationState === 'empty', editedRelease.timeline))

  // Return previous draft if the edited release isn't new or and has no content
  if (editedRelease.id > -1 ||
    (editedRelease.id === -1 &&
    editedRelease.notification.validationState === 'empty' &&
    editedRelease.validationState === 'empty' &&
    emptyTimelineItemsCount === editedRelease.timeline.length)
  ) {
    return state.draft
  }

  // Save draft to localStorage and database
  console.log('Saving draft to localStorage and database', editedRelease)

  const draft = JSON.stringify(editedRelease)

  window.localStorage.setItem(state.draftKey, draft)

  http({
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

  return editedRelease
}

function onAutoSave (state) {
  return R.assoc('draft', saveDraft(state), state)
}

function sendEmail (state, releaseId) {
  console.log('Sending email with release id', releaseId)

  http({
    url: `${urls.email}/${releaseId}`,
    requestOptions: {
      method: 'POST'
    },
    onSuccess: () => sendEmailBus.push('sent'),
    onError: error => sendEmailFailedBus.push(error)
  })
}

function onEmailSent (state) {
  console.log('Email sent')

  const alert = createAlert({
    variant: 'success',
    titleKey: 'sahkopostilahetetty'
  })

  view.alertsBus.push(alert)

  return state
}

function onSendEmailFailed (state) {
  console.error('Sending email failed')

  const alert = createAlert({
    variant: 'error',
    titleKey: 'sahkopostinlahetysepaonnistui'
  })

  view.alertsBus.push(alert)

  return state
}

function onAlertsReceived (state, alert) {
  return R.assocPath(['editor', 'alerts'], R.append(alert, state.editor.alerts), state)
}

// Updating state

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

// Autosave draft every 5 minutes
function createAutosaveInterval () {
  const interval = 60000 * 5

  return setInterval(() => {
    console.log('Autosaving draft')
    autoSaveBus.push('saved')
  }, interval)
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

  clearInterval(state.editor.autoSave)

  return R.compose(
    R.assoc('editor', emptyEditor()),
    R.assoc('draft', saveDraft(state))
  )(state)
}

function toggleTab (state, selectedTab) {
  console.log('Toggling editor tab', selectedTab)

  return R.assocPath(['editor', 'selectedTab'], selectedTab, state)
}

function togglePreview (state, isPreviewed) {
  console.log('Toggling release preview', isPreviewed)

  return R.assocPath(['editor', 'isPreviewed'], isPreviewed, state)
}

function toggleHasSaveFailed (state, hasSaveFailed) {
  return R.assocPath(['editor', 'hasSaveFailed'], !state.editor.hasSaveFailed, state)
}

function removeAlert (state, id) {
  console.log('Removing alert with id', id)

  const newAlerts = R.reject(alert => alert.id === id, state.editor.alerts)

  return R.assocPath(['editor', 'alerts'], newAlerts, state)
}

// Initial state

function emptyRelease () {
  return {
    id: -1,
    notification: editNotification.emptyNotification(),
    timeline: [editTimeline.newItem(-1, [])],
    categories: [],
    userGroups: [],
    targetingGroup: '',
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
    hasSaveFailed: false,
    saveErrorMessages: []
  }
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
  saveTargetingGroupBus,
  autoSaveBus,
  fetchReleaseBus,
  fetchReleaseFailedBus,
  sendEmailBus,
  sendEmailFailedBus,
  alertsBus,
  events,
  initialState,
  onSaveComplete,
  onSaveFailed,
  onAutoSave,
  onReleaseReceived,
  onFetchReleaseFailed,
  onEmailSent,
  onSendEmailFailed,
  onAlertsReceived,
  open,
  close,
  editDraft,
  toggleTab,
  togglePreview,
  toggleHasSaveFailed,
  removeAlert,
  save,
  saveDraft,
  targeting,
  editNotification,
  editTimeline
}

export default editor
