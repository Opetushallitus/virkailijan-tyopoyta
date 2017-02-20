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

function toggleCategory (state, category) {
  const categories = state.view.categories
  const newCategories = R.contains(category, categories)
    ? R.reject(c => c === category, categories)
    : R.append(category, categories)

  return update(state, { prop: 'categories', value: newCategories })
}

function toggleTab (state, selectedTab) {
  return update(state, { prop: 'selectedTab', value: selectedTab })
}

function toggleMenu (state) {
  return update(state, { prop: 'isMobileMenuVisible', value: !state.view.isMobileMenuVisible })
}

function removeAlert (state, id) {
  console.log('Removing alert with id', id)

  const newAlerts = R.reject(alert => alert.id === id, state.view.alerts)

  return update(state, { prop: 'alerts', value: newAlerts })
}

function emptyView () {
  return {
    categories: [],
    selectedTab: 'notifications',
    alerts: [],
    isMobileMenuVisible: false
  }
}

// Events for appState
const events = {
  toggleCategory,
  toggleTab,
  toggleMenu,
  removeAlert
}

const initialState = emptyView()

const view = {
  alertsBus,
  events,
  initialState,
  onAlertsReceived,
  toggleCategory,
  toggleTab,
  toggleMenu,
  removeAlert,
  emptyView
}

export default view
