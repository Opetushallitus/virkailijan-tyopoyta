import R from 'ramda'
import Bacon from 'baconjs'

import translations from './translations'

import http from './utils/http'
import createAlert from './utils/createAlert'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()
const saveSendEmailFailedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching user info')

  http({
    url: urls.details,
    onSuccess: user => fetchBus.push(user),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, user) {
  console.log('Received user', user)

  translations.fetch(user.lang || state.defaultLocale)

  const draftKey = `${state.draftKey}${user.userId}`

  // Get draft from localStorage or user info
  const draft = window.localStorage.getItem(draftKey) || user.draft

  return R.compose(
    R.assoc('draft', JSON.parse(draft)),
    R.assoc('draftKey', draftKey),
    R.assocPath(['notifications', 'categories'], user.profile.categories),
    R.assocPath(['user', 'isLoading'], false),
    R.assoc('user', user)
  )(state)
}

function onFetchFailed (state, error) {
  console.error('Fetching user info failed')

  window.location.replace(urls['login']);

  return R.compose(
    R.assocPath(['user', 'isLoading'], false),
    R.assocPath(['user', 'hasLoadingFailed'], true)
  )(state)
}

function saveSendEmail (state, option) {
  console.log('Saving sendEmail setting', option)

  const options = {
    id: state.user.userId,
    categories: state.user.profile.categories,
    email: option,
    firstlogin: false
  }

  http({
    url: urls.user,
    requestOptions: {
      method: 'POST',
      dataType: 'json',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(options)
    },
    onError: error => saveSendEmailFailedBus.push(error)
  })

  return state
}

function onSaveSendEmailFailed (state) {
  console.error('Saving sendEmail failed')

  const alert = createAlert({
    variant: 'error',
    titleKey: 'sahkopostiasetuksentallennusepaonnistui',
    textKey: 'tallennasahkopostiasetusuudestaan'
  })

  view.alertsBus.push(alert)

  return state
}

// Events for appState
const events = {
  saveSendEmail,
  onSaveSendEmailFailed
}

const initialState = {
  targetingGroups: [],
  draft: null,
  isLoading: true,
  hasLoadingFailed: false
}

const user = {
  events,
  initialState,
  fetchBus,
  fetchFailedBus,
  saveSendEmailFailedBus,
  fetch,
  saveSendEmail,
  onReceived,
  onFetchFailed,
  onSaveSendEmailFailed
}

export default user
