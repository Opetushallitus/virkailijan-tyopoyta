import R from 'ramda'
import Bacon from 'baconjs'

import { getStateData } from '../appState'
import http from './utils/http'
import localTranslations from '../data/translation.json'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch (language) {
  console.log('Fetching translations')

  http({
    url: `${urls['lokalisointi.localisation']}${language}`,
    requestOptions: {
      credentials: 'include'
    },
    onSuccess: translations => fetchBus.push(translations),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, response) {
  console.log('Received translations')

  // Get rest of the necessary data
  getStateData(state)

  window.translations = response

  return R.compose(
    R.assocPath(['translations', 'items'], response),
    R.assocPath(['translations', 'isLoading'], false)
  )(state)
}

function onFetchFailed (state) {
  console.warn('Fetching translations failed, using local translations')

  // Get rest of the necessary data
  getStateData(state)

  return R.compose(
    R.assocPath(['translations', 'items'], localTranslations),
    R.assocPath(['translations', 'isLoading'], false)
  )(state)
}

const initialState = {
  items: [],
  isLoading: true
}

const translations = {
  initialState,
  fetchBus,
  fetchFailedBus,
  fetch,
  onReceived,
  onFetchFailed
}

export default translations
