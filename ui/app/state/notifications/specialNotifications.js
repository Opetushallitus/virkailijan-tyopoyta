import R from 'ramda'
import Bacon from 'baconjs'

import view from '../view'
import getData from '../../utils/getData'
import createAlert from '../../utils/createAlert'
import urls from '../../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch (options) {
  console.log('Fetching special notifications')

  getData({
    url: urls['special.notifications'],
    onSuccess: notifications => fetchBus.push(notifications),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, response) {
  console.log('Received special notifications')

  R.forEach(item => (item.variant = 'special'), response)

  return R.compose(
    R.assocPath(['specialNotifications', 'items'], response),
    R.assocPath(['specialNotifications', 'isLoading'], false)
  )(state)
}

function onFetchFailed (state) {
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

function reset () {
  fetch()

  return emptyState()
}

function emptyState () {
  return {
    items: [],
    isLoading: true,
    hasLoadingFailed: false
  }
}

const initialState = emptyState()

const specialNotifications = {
  fetchBus,
  fetchFailedBus,
  initialState,
  fetch,
  onReceived,
  onFetchFailed,
  reset
}

export default specialNotifications
