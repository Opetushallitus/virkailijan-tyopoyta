import R from 'ramda'
import Bacon from 'baconjs'
import moment from 'moment'

import editRelease from './editRelease'
import editNotification from './editNotification'
import editTimeline from './editTimeline'
import notifications from '../notifications'
import timeline from '../timeline'
import getData from '../../utils/getData'
import createAlert from '../../utils/createAlert'
import * as testData from '../../resources/test/testData.json'

const url = '/virkailijan-tyopoyta/api/release'

const savedReleasesBus = new Bacon.Bus()
const failedReleasesBus = new Bacon.Bus()

function toggleValue (value, values) {
  let newValues

  R.contains(value, values)
    ? newValues = R.reject(val => val === value, values)
    : newValues = R.concat(values, value)

  return newValues
}

function cleanUpDocument (document) {
  return R.assoc('timeline', document.timeline.filter(tl => tl.date != null), document)
}

function removeDocumentProperties (key, value) {
  if (key === 'validationState') {
    return undefined
  }

  return value
}

function clear (state) {
  console.log('Clearing editor')

  return R.assocPath(['editor', 'editedRelease'], editRelease.emptyRelease(), state)
}

function toggle (state, releaseId = -1, selectedTab = 'edit-notification') {
  const newState = R.assocPath(['editor', 'isVisible'], !state.editor.isVisible, state)
  const stateWithoutError = R.assocPath(['editor', 'hasSaveFailed'], false, newState)

  document.body.classList.add('overflow-hidden')

  // Toggle preview mode off and clear editor when closing
  if (state.editor.isVisible) {
    console.log('Closing editor')

    document.body.classList.remove('overflow-hidden')

    const stateWithClearedEditor = clear(stateWithoutError)
    const stateWithoutLoading = R.assocPath(['editor', 'isLoading'], false, stateWithClearedEditor)

    return togglePreview(stateWithoutLoading, false)
  } else if (releaseId > -1) {
    // Display correct tab depending if user edits a notification or a timeline item
    console.log('Toggling editor with release id', releaseId)

    const selectedRelease = state.releases.find(release => release.id === releaseId)
    const stateWithRelease = R.assocPath(['editor', 'editedRelease'], selectedRelease, stateWithoutError)

    return toggleTab(stateWithRelease, selectedTab)
  } else {
  // Display notification tab when creating a new release
    return toggleTab(stateWithoutError, selectedTab)
  }
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

function save (state) {
  console.log('Saving document')

  getData({
    url: url,
    requestOptions: {
      method: 'POST',
      dataType: 'json',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(cleanUpDocument(state.editor.editedRelease), state.editor.onSave)
    },
    onSuccess: json => savedReleasesBus.push(json),
    onError: error => failedReleasesBus.push(error)
  })

  return R.assocPath(['editor', 'isLoading'], true, state)
}

function onSaveComplete (state) {
  console.log('Release saved')

  const month = moment().format('M')
  const year = moment().format('YYYY')

  const alert = createAlert({
    type: 'success',
    title: 'Julkaisu onnistui'
  })

  const newViewAlerts = R.append(alert, state.view.alerts)
  const stateWithAlert = R.assocPath(['view', 'alerts'], newViewAlerts, state)

  // Update view
  notifications.fetch()

  timeline.fetch({
    month,
    year
  })

  // Only toggle editor if user hasn't closed it already
  return toggle(stateWithAlert)
}

function onSaveFailed (state) {
  console.log('Saving release failed')

  const newState = R.assocPath(['editor', 'isLoading'], false, state)

  return R.assocPath(['editor', 'hasSaveFailed'], true, newState)
}

// Events for appState
const events = {
  toggle,
  toggleTab,
  togglePreview,
  toggleHasSaveFailed,
  save,
  editRelease: editRelease.events,
  editNotification: editNotification.events,
  editTimeline: editTimeline.events
}

const initialState = {
  isVisible: false,
  isPreviewed: false,
  isLoading: false,
  hasSaveFailed: false,
  categories: testData.releaseCategories,
  userGroups: testData.userGroups,
  editedRelease: editRelease.emptyRelease(),
  selectedTab: 'edit-notification',
  onSave: removeDocumentProperties
}

const editor = {
  savedReleasesBus,
  failedReleasesBus,
  events,
  initialState,
  onSaveComplete,
  onSaveFailed,
  toggle,
  toggleTab,
  togglePreview,
  toggleHasSaveFailed,
  toggleValue,
  save,
  editRelease,
  editNotification,
  editTimeline
}

export default editor
