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

function fetch (locale) {
  console.log('Fetching user groups')

  // getData({
  //   url: url,
  //   searchParams: {
  //     locale
  //   },
  //   onSuccess: userGroups => fetchBus.push(userGroups),
  //   onError: error => fetchFailedBus.push(error)
  // })

  fetchBus.push(testData.userGroups)
}

function onReceived (state, userGroups) {
  console.log('Received user groups')

  return R.compose(
    R.assocPath(['userGroups', 'items'], userGroups),
    R.assocPath(['userGroups', 'isLoading'], false)
  )(state)
}

function onFailed (state) {
  const alert = createAlert({
    type: 'error',
    titleKey: 'kayttajaryhmienhakuepaonnistui',
    textKey: 'suljejaavaaeditori'
  })

  editor.alertsBus.push(alert)

  return R.assocPath(['userGroups', 'isLoading'], false, state)
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
