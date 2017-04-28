import R from 'ramda'
import Bacon from 'baconjs'

import view from './view'
import editor from './editor/editor'
import http from './utils/http'
import createAlert from './utils/createAlert'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching categories')

  http({
    url: urls.categories,
    onSuccess: categories => fetchBus.push(categories),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, categories) {
  console.log('Received categories')

  return R.compose(
    R.assocPath(['categories', 'items'], categories),
    R.assocPath(['categories', 'isLoading'], false)
  )(state)
}

// Display an error in the view and in the editor if fetching fails
function onFetchFailed (state) {
  console.error('Fetching categories failed')

  const alert = createAlert({
    variant: 'error',
    titleKey: 'kategorioidenhakuepaonnistui',
    textKey: 'paivitasivu'
  })

  view.alertsBus.push(alert)
  editor.alertsBus.push(alert)

  return R.compose(
    R.assocPath(['editor', 'hasLoadingDependenciesFailed'], true),
    R.assocPath(['categories', 'isLoading'], false),
    R.assocPath(['categories', 'hasLoadingFailed'], true)
  )(state)
}

function emptyCategories () {
  return {
    items: [],
    isLoading: true,
    hasLoadingFailed: false
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
