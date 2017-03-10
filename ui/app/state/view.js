import R from 'ramda'
import Bacon from 'baconjs'

const alertsBus = new Bacon.Bus()

function update (state, { prop, value }) {
  console.log('Updating view', prop, value)

  return R.assocPath(['view', prop], value, state)
}

function onAlertsReceived (state, alert) {
  const newViewAlerts = R.append(alert, state.view.alerts)

  return update(state, { prop: 'alerts', value: newViewAlerts })
}

function toggleTab (state, selectedTab) {
  return update(state, { prop: 'selectedTab', value: selectedTab })
}

function removeAlert (state, id) {
  console.log('Removing alert with id', id)

  const newAlerts = R.reject(alert => alert.id === id, state.view.alerts)

  return update(state, { prop: 'alerts', value: newAlerts })
}

function emptyView () {
  return {
    selectedTab: 'notifications',
    alerts: []
  }
}

// Events for appState
const events = {
  toggleTab,
  removeAlert
}

const initialState = emptyView()

const view = {
  alertsBus,
  events,
  initialState,
  onAlertsReceived,
  toggleTab,
  removeAlert,
  emptyView
}

export default view
