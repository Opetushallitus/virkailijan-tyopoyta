import R from 'ramda'
import Bacon from 'baconjs'

// TODO: Remove test data

import view from './view'
import editor from './editor/editor'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'
import * as testData from '../resources/test/testData.json'

const url = '/virkailijan-tyopoyta/api/tags'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching tags')

  // getData({
  //   url: url,
  //   onSuccess: tags => fetchBus.push(tags),
  //   onError: error => fetchFailedBus.push(error)
  // })

  fetchBus.push(testData.tags)
}

function onReceived (state, tags) {
  console.log('Received tags')

  const regularTags = R.reject(tags => tags.name === 'SPECIAL')(tags)
  const specialTags = R.prop('items', R.find(R.propEq('name', 'SPECIAL'))(tags))

  return R.compose(
    R.assocPath(['tags', 'items'], regularTags),
    R.assocPath(['tags', 'specialTags'], specialTags),
    R.assocPath(['tags', 'isLoading'], false)
  )(state)
}

function onFetchFailed (state) {
  const alert = createAlert({
    type: 'error',
    titleKey: 'avainsanojenhakuepaonnistui',
    textKey: 'paivitasivu'
  })

  view.alertsBus.push(alert)
  editor.alertsBus.push(alert)

  return R.compose(
    R.assocPath(['editor', 'hasLoadingDependenciesFailed'], true),
    R.assocPath(['tags', 'hasLoadingFailed'], true),
    R.assocPath(['tags', 'isLoading'], false)
  )(state)
}

function emptyTags () {
  return {
    items: [],
    specialTags: [],
    isLoading: true,
    hasLoadingFailed: false
  }
}

const initialState = emptyTags()

const tags = {
  fetchBus,
  fetchFailedBus,
  initialState,
  fetch,
  onReceived,
  onFetchFailed
}

export default tags
