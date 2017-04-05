import R from 'ramda'
import Bacon from 'baconjs'
import moment from 'moment'

import categories from './categories'
import userGroups from './userGroups'
import tagGroups from './tagGroups'
import notifications from './notifications'
import timeline from './timeline'

// TODO: Remove test data

import getData from '../utils/getData'
import urls from '../data/virkailijan-tyopoyta-urls.json'
import * as testData from '../resources/test/testData.json'

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
  tagGroups.fetch()

  notifications.fetch({
    page: 1,
    categories: response.profile.categories
  })

  timeline.fetch({
    month,
    year
  })

  const draftKey = `virkailijanTyopoyta${response.userId}`

  return R.compose(
    R.assoc('draft', JSON.parse(window.localStorage.getItem(draftKey)) || response.profile.draft),
    R.assoc('draftKey', draftKey),
    R.assocPath(['notifications', 'categories'], response.profile.categories),
    R.assocPath(['user', 'targetingGroups'], testData.targetingGroups),
    R.assocPath(['user', 'isLoading'], false),
    R.assoc('user', response)
  )(state)
}

function onFetchFailed (state) {
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
