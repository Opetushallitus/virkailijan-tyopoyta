import R from 'ramda'
import Bacon from 'baconjs'

const alertsBus = new Bacon.Bus()

function update (state, { prop, value }) {
  console.log('Updating view', prop, value)

  return R.assocPath(['view', prop], value, state)
}

function onAlertsReceived (state, alert) {
  const alerts = state.view.alerts
  const maxCount = 5

  // Remove last alert if view has max count of alerts
  if (R.equals(maxCount, R.length(alerts))) {
    return update(state, { prop: 'alerts', value: R.prepend(alert, R.dropLast(1, state.view.alerts)) })
  }

  // Remove previous alert if it has the same title
  if (R.length(alerts) > 0 && R.equals(alert.titleKey, R.prop('titleKey', R.head(alerts)))) {
    return update(state, { prop: 'alerts', value: R.prepend(alert, R.drop(1, state.view.alerts)) })
  }

  return update(state, { prop: 'alerts', value: R.prepend(alert, state.view.alerts) })
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
