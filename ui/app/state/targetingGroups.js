import R from 'ramda'
import Bacon from 'baconjs'

import view from './view'
import editor from './editor/editor'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()
const saveBus = new Bacon.Bus()
const removeBus = new Bacon.Bus()
const removeFailedBus = new Bacon.Bus()

const newTargetingGroup = ({ name, categories, userGroups, tags }, specialTags) => {
  return {
    name,
    data: {
      categories,
      userGroups,
      // Filter out special tags
      tags: R.reject(tag => R.contains(tag, R.pluck('id', specialTags)), tags)
    },
    isRemoving: false
  }
}

function fetch (state) {
  console.log('Fetching targeting groups')

  getData({
    url: urls['targeting.groups'],
    onSuccess: targetingGroups => fetchBus.push(targetingGroups),
    onError: error => fetchFailedBus.push(error)
  })
}

function onReceived (state, targetingGroups) {
  console.log('Received targeting groups')

  R.forEach(targetingGroup => (targetingGroup.data = JSON.parse(targetingGroup.data)), targetingGroups)

  return R.compose(
    R.assocPath(['targetingGroups', 'items'], targetingGroups),
    R.assocPath(['targetingGroups', 'isLoading'], false)
  )(state)
}

function onFetchFailed (state) {
  console.log('Fetching targeting groups failed')

  const alert = createAlert({
    variant: 'error',
    titleKey: 'kohderyhmavalintojenhakuepaonnistui'
  })

  editor.alertsBus.push(alert)

  return R.assocPath(['targetingGroups', 'isLoading'], false, state)
}

function onSaveComplete (state, { result }) {
  if (!result) {
    console.log('Saving targeting group failed')

    const alert = createAlert({
      variant: 'error',
      titleKey: 'kohderyhmavalinnantallennusepaonnistui'
    })

    return R.assocPath(['view', 'alerts'], view.setNewAlerts(alert, state.view.alerts), state)
  }

  console.log('Targeting group saved')

  fetch()

  return R.assoc('targetingGroups', initialState, state)
}

function onRemoveComplete (state, id) {
  console.log('Targeting group removed')

  const newTargetingGroups = R.reject(
    targetingGroup => targetingGroup.id === id,
    R.path(['targetingGroups', 'items'], state)
  )

  return R.assocPath(['targetingGroups', 'items'], newTargetingGroups, state)
}

function onRemoveFailed (state, id) {
  console.log('Remove targeting group failed')

  const newTargetingGroups = update(id, state.targetingGroups.items, {
    isRemoving: false,
    hasRemoveFailed: true
  })

  return R.assocPath(['targetingGroups', 'items'], newTargetingGroups, state)
}

function update (id, targetingGroups, options) {
  const targetingGroup = R.find(R.propEq('id', id))(targetingGroups)
  const index = R.findIndex(R.propEq('id', id))(targetingGroups)

  const newTargetingGroup = R.compose(
    R.assoc('isRemoving', options.isRemoving),
    R.assoc('hasRemoveFailed', options.hasRemoveFailed)
  )(targetingGroup)

  return R.update(index, newTargetingGroup, targetingGroups)
}

function save (state, targetingGroup) {
  console.log('Saving targeting group')

  getData({
    url: urls['targeting.groups'],
    requestOptions: {
      method: 'POST',
      dataType: 'json',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(newTargetingGroup(targetingGroup, state.tagGroups.specialTags))
    },
    onSuccess: () => saveBus.push({ result: true }),
    onError: () => saveBus.push({ result: false })
  })
}

const initialState = {
  items: [],
  isLoading: true
}

const targetingGroups = {
  initialState,
  fetchBus,
  fetchFailedBus,
  saveBus,
  removeBus,
  removeFailedBus,
  fetch,
  onReceived,
  onFetchFailed,
  onSaveComplete,
  onRemoveComplete,
  onRemoveFailed,
  save,
  update
}

export default targetingGroups

