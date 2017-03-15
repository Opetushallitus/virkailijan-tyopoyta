import R from 'ramda'
import Bacon from 'baconjs'
import moment from 'moment'

import view from './view'
import categories from './categories'
import userGroups from './userGroups'
import tags from './tag-groups'
import notifications from './notifications'
import timeline from './timeline'

import getData from '../utils/getData'
import createAlert from '../utils/createAlert'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
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

  const month = moment().format('M')
  const year = moment().format('YYYY')

  categories.fetch()
  userGroups.fetch()
  tags.fetch()

  notifications.fetch({
    page: 1,
    categories: response.profile.categories
  })

  timeline.fetch({
    month,
    year
  })

  return R.compose(
    R.assocPath(['notifications', 'categories'], response.profile.categories),
    R.assocPath(['user', 'isLoading'], false),
    R.assoc('user', response)
  )(state)
}

function onFetchFailed (state) {
  const alert = createAlert({
    type: 'error',
    titleKey: 'kayttajatietojenhakuepaonnistui',
    textKey: 'paivitasivu'
  })

  view.alertsBus.push(alert)

  return R.compose(
    R.assocPath(['user', 'isLoading'], false),
    R.assocPath(['user', 'hasLoadingFailed'], true)
  )(state)
}

const initialState = {
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
