import R from 'ramda'
import Bacon from 'baconjs'

import view from './view'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'

const url = '/virkailijan-tyopoyta/api/categories'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching categories')

  getData({
    url: url,
    onSuccess: categories => fetchBus.push(categories),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, categories) {
  console.log('Received categories')

  return R.compose(
    R.assocPath(['categories', 'items'], categories),
    R.assocPath(['categories', 'isLoading'], false),
    R.assocPath(['categories', 'isInitialLoad'], false)
  )(state)
}

function onFetchFailed (state) {
  const alert = createAlert({
    type: 'error',
    titleKey: 'kategorioidenhakuepaonnistui',
    textKey: 'paivitasivu'
  })

  view.alertsBus.push(alert)

  return R.compose(
    R.assocPath(['categories', 'isLoading'], false),
    R.assocPath(['categories', 'isInitialLoad'], false)
  )(state)
}

function emptyCategories () {
  return {
    items: [],
    isLoading: true,
    isInitialLoad: true
  }
}

const initialState = emptyCategories()

const categories = {
  fetchBus,
  fetchFailedBus,
  initialState,
  fetch,
  onReceived,
  onFetchFailed
}

export default categories
