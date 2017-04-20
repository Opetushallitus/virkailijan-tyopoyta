import R from 'ramda'
import Bacon from 'baconjs'

import { getStateData } from '../appState'
import getData from '../utils/getData'
import localTranslations from '../data/translation.json'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch (language) {
  console.log('Fetching translations')

  getData({
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

  getStateData(state)

  window.translations = response

  return R.compose(
    R.assocPath(['translations', 'items'], response),
    R.assocPath(['translations', 'isLoading'], false)
  )(state)
}

function onFetchFailed (state) {
  console.log('Fetching translations failed, using local translations')

  getStateData(state)

  window.translations = localTranslations

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
