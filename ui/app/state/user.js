import R from 'ramda'
import Bacon from 'baconjs'
import moment from 'moment'

import view from './view'
import categories from './categories'
import userGroups from './userGroups'
import tags from './tags'
import notifications from './notifications'
import timeline from './timeline'

import getData from '../utils/getData'
import createAlert from '../utils/createAlert'
// import urls from './data/virkailijan-tyopoyta-urls.json'

const authUrl = '/virkailijan-tyopoyta/login'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
  getData({
    url: authUrl,
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
    R.assoc('user', response)
  )(state)
}

function onFetchFailed (state) {
  const alert = createAlert({
    type: 'error',
    title: 'Käyttäjätietojen haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  view.alertsBus.push(alert)

  return R.assocPath(['user', 'hasLoginFailed'], true, state)
}

const user = {
  fetchBus,
  fetchFailedBus,
  fetch,
  onReceived,
  onFetchFailed
}

export default user
