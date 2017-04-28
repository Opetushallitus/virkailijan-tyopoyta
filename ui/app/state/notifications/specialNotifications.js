import R from 'ramda'
import Bacon from 'baconjs'

import view from '../view'
import http from '../utils/http'
import createAlert from '../utils/createAlert'
import urls from '../../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch (options) {
  console.log('Fetching special notifications')

  http({
    url: urls['special.notifications'],
    onSuccess: notifications => fetchBus.push(notifications),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, notifications) {
  console.log('Received special notifications')

  // Set variant for rendering and state handling
  R.forEach(item => (item.variant = 'special'), notifications)

  return R.compose(
    R.assocPath(['specialNotifications', 'items'], notifications),
    R.assocPath(['specialNotifications', 'isLoading'], false)
  )(state)
}

function onFetchFailed (state) {
  console.error('Fetching special notifications failed')

  const alert = createAlert({
    variant: 'error',
    titleKey: 'hairiotiedotteidenhakuepaonnistui',
    textKey: 'paivitasivu'
  })

  view.alertsBus.push(alert)

  return R.compose(
    R.assocPath(['specialNotifications', 'isLoading'], false),
    R.assocPath(['specialNotifications', 'hasLoadingFailed'], true)
  )(state)
}

function emptyNotifications () {
  return {
    items: [],
    isLoading: true,
    hasLoadingFailed: false
  }
}

const initialState = emptyNotifications()

const specialNotifications = {
  fetchBus,
  fetchFailedBus,
  initialState,
  fetch,
  onReceived,
  onFetchFailed
}

export default specialNotifications
