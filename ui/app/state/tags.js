import R from 'ramda'
import Bacon from 'baconjs'

// TODO: Remove test data

import view from './view'
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

  // Reject tag group with special tags (name = 'SPECIAL')
  const filteredTags = R.reject(tags => tags.name === 'SPECIAL')(testData.tags)

  fetchBus.push(filteredTags)
}

function onReceived (state, tags) {
  console.log('Received tags')

  return R.compose(
    R.assocPath(['tags', 'items'], tags),
    R.assocPath(['tags', 'isLoading'], false)
  )(state)
}

function onFailed (state) {
  const alert = createAlert({
    type: 'error',
    title: 'Avainsanojen haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  view.alertsBus.push(alert)

  return R.assocPath(['tags', 'isLoading'], false, state)
}

function emptyTags () {
  return {
    items: [],
    isLoading: true
  }
}

const initialState = emptyTags()

const tags = {
  fetchBus,
  fetchFailedBus,
  initialState,
  fetch,
  onReceived,
  onFailed
}

export default tags
