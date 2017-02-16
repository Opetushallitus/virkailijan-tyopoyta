import R from 'ramda'
import Bacon from 'baconjs'

import view from './view'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'

const url = '/virkailijan-tyopoyta/api/tags'

const bus = new Bacon.Bus()
const failedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching tags')

  getData({
    url: url,
    onSuccess: tags => bus.push(tags),
    onError: error => failedBus.push(error)
  })
}

function onReceived (state, tags) {
  console.log('Received tags')

  const newState = R.assocPath(['notifications', 'tagsLoading'], false, state)

  return R.assocPath(['notifications', 'tags'], tags, newState)
}

function onFailed (state) {
  const alert = createAlert({
    type: 'error',
    title: 'Tunnisteiden haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  view.alertsBus.push(alert)

  return R.assocPath(['tags', 'isLoading'], false, state)
}

const tags = {
  bus,
  failedBus,
  fetch,
  onReceived,
  onFailed
}

export default tags
