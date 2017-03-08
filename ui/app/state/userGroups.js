import R from 'ramda'
import Bacon from 'baconjs'

// TODO: Remove test data

import editor from './editor/editor'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'
import * as testData from '../resources/test/testData.json'

const url = '/virkailijan-tyopoyta/api/usergroups'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch () {
  console.log('Fetching user groups')

  // getData({
  //   url: url,
  //   onSuccess: tags => fetchBus.push(userGroups),
  //   onError: error => fetchFailedBus.push(error)
  // })

  fetchBus.push(testData.userGroups)
}

function onReceived (state, userGroups) {
  console.log('Received user groups')

  const newUserGroups = R.prepend(allUserGroupsItem(), userGroups)

  return R.compose(
    R.assocPath(['userGroups', 'items'], newUserGroups),
    R.assocPath(['userGroups', 'isLoading'], false)
  )(state)
}

function onFailed (state) {
  const alert = createAlert({
    type: 'error',
    title: 'Käyttäjäryhmien haku epäonnistui',
    text: 'Sulje ja avaa editori uudestaan hakeaksesi uudelleen'
  })

  editor.alertsBus.push(alert)

  return R.assocPath(['userGroups', 'isLoading'], false, state)
}

function allUserGroupsItem () {
  return {
    id: -1,
    name: 'Kohdenna kaikille käyttöoikeusryhmille'
  }
}

function emptyUserGroups () {
  return {
    items: [],
    isLoading: true
  }
}

const initialState = emptyUserGroups()

const tags = {
  fetchBus,
  fetchFailedBus,
  initialState,
  fetch,
  onReceived,
  onFailed
}

export default tags
