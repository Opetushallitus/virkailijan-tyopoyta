import R from 'ramda'

// TODO: Remove test data

import editor from './editor'
import { validate, rules } from './validation'
import * as testData from '../../resources/test/testData.json'

function update (state, { prop, value }) {
  console.log('Updating release', prop, value)

  const path = ['editor', 'editedRelease']
  const newState = R.assocPath(R.append(prop, path), value, state)

  // Validate release
  const validatedRelease = validate(
    R.path(path, newState),
    rules(state.editor.editedRelease)['release']
  )

  return R.assocPath(path, validatedRelease, state)
}

function toggleCategory (state, category) {
  console.log('Toggling category with id', category)

  const categories = state.editor.editedRelease.categories
  const newCategories = R.contains(category, categories)
    ? R.reject(c => c === category, categories)
    : R.append(category, categories)

  return removeSelectedTags(
    R.assocPath(['editor', 'editedRelease', 'categories'], newCategories, state),
    category
  )
}

function toggleUserGroup (state, value) {
  const groups = state.editor.editedRelease.userGroups
  const newGroups = editor.toggleValue(value, groups)

  return update(state, { prop: 'userGroups', value: newGroups })
}

function removeSelectedTags (state, categoryId) {
  const editedRelease = state.editor.editedRelease
  const tags = testData.tags
  const selectedTags = editedRelease.notification.tags
  const selectedCategories = editedRelease.categories

  if (selectedCategories.length === 0) {
    return state
  }

  const allowedTags = R.pluck('id', R.flatten(R.pluck('items',
    R.filter(group => R.length(R.intersection(group.categories, selectedCategories)), tags)
  )))

  const newSelectedTags = R.filter(tag => R.contains(tag, allowedTags), selectedTags)
  const newState = R.assocPath(['editor', 'editedRelease', 'notification', 'tags'], newSelectedTags, state)

  return R.assocPath(
    ['editor', 'editedRelease'],
    validate(
      newState.editor.editedRelease,
      rules(newState.editor.editedRelease)['release']
    ),
    newState
  )
}

function toggleTag (state, id) {
  console.log('Toggled tag with id ' + id)

  const selectedTags = state.editor.editedRelease.notification.tags
  const newSelectedTags = R.contains(id, selectedTags)
    ? R.reject(selected => selected === id, selectedTags)
    : R.append(id, selectedTags)

  const newState = R.assocPath(['editor', 'editedRelease', 'notification', 'tags'], newSelectedTags, state)

  return R.assocPath(
    ['editor', 'editedRelease'],
    validate(
      newState.editor.editedRelease,
      rules(newState.editor.editedRelease)['release']
    ),
    newState
  )
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
