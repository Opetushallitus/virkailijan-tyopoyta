import R from 'ramda'

// VIEW

function update (state, { prop, value }) {
  console.log('Updating view', prop, value)

  return R.assocPath(['view', prop], value, state)
}

function toggleCategory (state, category) {
  console.log('Toggling view category', category)

  const categories = state.view.categories
  const newCategories = R.contains(category, categories)
    ? R.reject(c => c === category, categories)
    : R.append(category, categories)

  return update(state, { prop: 'categories', value: newCategories })
}

function toggleTab (state, selectedTab) {
  console.log('Toggling view tab', selectedTab)

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

const view = {
  toggleCategory,
  toggleTab,
  toggleMenu,
  removeAlert
}

export default view
