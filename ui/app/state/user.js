import R from 'ramda'
import Bacon from 'baconjs'

import translations from './translations'

import getData from './utils/getData'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching user info')

  getData({
    url: urls.login,
    requestOptions: {
      mode: 'no-cors'
    },
    onSuccess: user => fetchBus.push(user),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, response) {
  console.log('Received user', response)

  translations.fetch(response.lang || state.defaultLocale)

  const draftKey = `${state.draftKey}${response.userId}`
  const draft = window.localStorage.getItem(draftKey) || response.draft

  return R.compose(
    R.assoc('draft', JSON.parse(draft)),
    R.assoc('draftKey', draftKey),
    R.assocPath(['notifications', 'categories'], response.profile.categories),
    R.assocPath(['user', 'isLoading'], false),
    R.assoc('user', response)
  )(state)
}

function onFetchFailed (state, error) {
  console.log('Fetching user info failed')

  // Redirect to login page if response is not JSON
  if (error.toString().indexOf('SyntaxError') >= 0) {
    window.location.replace(urls['cas.login'])

    return state
  }

  return R.compose(
    R.assocPath(['user', 'isLoading'], false),
    R.assocPath(['user', 'hasLoadingFailed'], true)
  )(state)
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
  fetch,
  onReceived,
  onFetchFailed
}

export default user
