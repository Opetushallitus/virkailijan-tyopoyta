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

  fetchBus.push(testData.tags)
}

function onReceived (state, tags) {
  console.log('Received tags')

  const regularTags = R.reject(tags => tags.type === 'SPECIAL')(tags)
  const specialTags = R.prop('items', R.find(R.propEq('type', 'SPECIAL'))(tags))

  return R.compose(
    R.assocPath(['tags', 'items'], regularTags),
    R.assocPath(['tags', 'specialTags'], specialTags),
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
    specialTags: [],
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
