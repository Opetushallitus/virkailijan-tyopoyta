import R from 'ramda'
import Bacon from 'baconjs'

import view from './view'
import editor from './editor/editor'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching tag groups')

  getData({
    url: urls['tags'],
    onSuccess: tagGroups => fetchBus.push(tagGroups),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, tagGroups) {
  console.log('Received tag groups')

  const regularTags = R.reject(tagGroup => tagGroup.name === 'SPECIAL')(tagGroups)
  const specialTags = R.prop('tags', R.find(R.propEq('name', 'SPECIAL'))(tagGroups))

  return R.compose(
    R.assocPath(['tagGroups', 'items'], regularTags),
    R.assocPath(['tagGroups', 'specialTags'], specialTags),
    R.assocPath(['tagGroups', 'isLoading'], false)
  )(state)
}

function onFetchFailed (state) {
  const alert = createAlert({
    variant: 'error',
    titleKey: 'avainsanojenhakuepaonnistui',
    textKey: 'paivitasivu'
  })

  view.alertsBus.push(alert)
  editor.alertsBus.push(alert)

  return R.compose(
    R.assocPath(['editor', 'hasLoadingDependenciesFailed'], true),
    R.assocPath(['tagGroups', 'hasLoadingFailed'], true),
    R.assocPath(['tagGroups', 'isLoading'], false)
  )(state)
}

function emptyTagGroups () {
  return {
    items: [],
    specialTags: [],
    isLoading: true,
    hasLoadingFailed: false
  }
}

const initialState = emptyTagGroups()

const tagGroups = {
  fetchBus,
  fetchFailedBus,
  initialState,
  fetch,
  onReceived,
  onFetchFailed
}

export default tagGroups
