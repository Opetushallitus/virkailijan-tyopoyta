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
    requestOptions: {
      mode: 'no-cors'
    },
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

  // Redirect to login page on test/QA/production environment, display error on localhost if response is not JSON
  if (error.toString().indexOf('SyntaxError') >= 0 && window.location.hostname !== 'localhost') {
    console.warn('Sign in to CAS first')

    //window.location.replace(urls['user.details'])
  }

  return R.compose(
    R.assocPath(['user', 'isLoading'], false),
    R.assocPath(['user', 'hasLoadingFailed'], true)
  )(state)
}

function saveSendEmail (option) {
  console.log('Saving sendEmail setting', option)

  const options = {
    email: option
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


const initialState = {
  targetingGroups: [],
  draft: null,
  isLoading: true,
  hasLoadingFailed: false
}

const user = {
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
