import R from 'ramda'
import Bacon from 'baconjs'

import editor from './editor/editor'
import http from './utils/http'
import createAlert from './utils/createAlert'

import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching user groups')

  http({
    url: urls['user.groups'],
    onSuccess: userGroups => fetchBus.push(userGroups),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, userGroups) {
  console.log('Received user groups')

  return R.compose(
    R.assocPath(['userGroups', 'items'], userGroups),
    R.assocPath(['userGroups', 'isLoading'], false)
  )(state)
}

function onFetchFailed (state) {
  console.error('Fetching user groups failed')

  const alert = createAlert({
    variant: 'error',
    titleKey: 'kayttajaryhmienhakuepaonnistui',
    textKey: 'paivitasivu'
  })

  editor.alertsBus.push(alert)

  return R.compose(
    R.assocPath(['editor', 'hasLoadingDependenciesFailed'], true),
    R.assocPath(['userGroups', 'isLoading'], false)
  )(state)
}

function emptyUserGroups () {
  return {
    items: [],
    isLoading: true
  }
}

const initialState = emptyUserGroups()

const tags = {
  fetchBus,
  fetchFailedBus,
  initialState,
  fetch,
  onReceived,
  onFetchFailed
}

export default tags
