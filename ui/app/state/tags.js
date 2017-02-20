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

function reset () {
  fetch()

  return emptyTags()
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
    title: 'Tunnisteiden haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  view.alertsBus.push(alert)

  return R.assocPath(['tags', 'isLoading'], false, state)
}

function toggle (state, id) {
  console.log('Toggled tag with id', id)

  const selectedItems = state.tags.selectedItems
  const newSelectedItems = R.contains(id, selectedItems)
    ? R.reject(selected => selected === id, selectedItems)
    : R.append(id, selectedItems)

  return setSelectedItems(state, newSelectedItems)
}

function setSelectedItems (state, selected) {
  console.log('Updating selected tags', selected)

  return R.assocPath(
    ['tags', 'selectedItems'],
    selected,
    state
  )
}

function emptyTags () {
  return {
    items: [],
    selectedItems: [],
    isLoading: true
  }
}

const initialState = emptyTags()

const events = {
  toggle,
  setSelectedItems
}

const tags = {
  bus,
  failedBus,
  initialState,
  events,
  fetch,
  reset,
  onReceived,
  onFailed,
  toggle,
  setSelectedItems
}

export default tags
