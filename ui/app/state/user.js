import R from 'ramda'
import Bacon from 'baconjs'
import moment from 'moment'

import categories from './categories'
import userGroups from './userGroups'
import tagGroups from './tagGroups'
import targetingGroups from './targetingGroups'
import notifications from './notifications/notifications'
import specialNotifications from './notifications/specialNotifications'
import timeline from './timeline'

import getData from '../utils/getData'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching user info')

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
  tagGroups.fetch()
  targetingGroups.fetch()

  specialNotifications.fetch()

  notifications.fetch({
    page: 1,
    categories: response.profile.categories
  })

  timeline.fetch({
    month,
    year
  })

  const draftKey = `${state.draftKey}${response.userId}`
  const draft = window.localStorage.getItem(draftKey) || response.draft

  return R.compose(
    R.assoc('draft', JSON.parse(draft)),
    R.assoc('draftKey', draftKey),
    R.assocPath(['notifications', 'categories'], response.profile.categories),
    R.assocPath(['user', 'isLoading'], false),
    R.assoc('user', response)
  )(state)
}

function onFetchFailed (state, error) {
  console.log('Fetching user info failed')

  // Redirect to login page if response is not JSON
  if (error.toString().indexOf('SyntaxError') >= 0) {
    window.location.replace(urls.login)

    return state
  }

  return R.compose(
    R.assocPath(['user', 'isLoading'], false),
    R.assocPath(['user', 'hasLoadingFailed'], true)
  )(state)
}

const initialState = {
  targetingGroups: [],
  draft: null,
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
