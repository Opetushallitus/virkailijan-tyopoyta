import R from 'ramda'

import editor from './editor'
import { validate, rules } from './validation'


function update (state, { prop, value }) {
  console.log('Updating release', prop, value)

  const path = ['editor', 'editedRelease']
  const newState = R.assocPath(R.append(prop, path), value, state)

  // Validate release
  const validatedRelease = validate(R.path(path, newState), rules['release'])

  return R.assocPath(path, validatedRelease, state)
}

function toggleCategory (state, category) {
  const categories = state.editor.editedRelease.categories
  const newCategories = R.contains(category, categories)
    ? R.reject(c => c === category, categories)
    : R.append(category, categories)

  return update(state, { prop: 'categories', value: newCategories })
}

function toggleUserGroup (state, value) {
  const groups = state.editor.editedRelease.userGroups
  const newGroups = editor.toggleValue(value, groups)

  return update(state, { prop: 'userGroups', value: newGroups })
}

function toggleTag (state, id) {
  console.log('Toggled tag with id', id)

  const selectedTags = state.editor.editedRelease.notification.tags
  const newSelectedTags = R.contains(id, selectedTags)
    ? R.reject(selected => selected === id, selectedTags)
    : R.append(id, selectedTags)

  return editor.editNotification.update(state, { prop: 'tags', value: newSelectedTags })
}

// Events for appState
const events = {
  update,
  toggleCategory,
  toggleUserGroup,
  toggleTag
}

const editRelease = {
  events,
  update,
  toggleCategory,
  toggleUserGroup,
  toggleTag
}

export default editRelease
