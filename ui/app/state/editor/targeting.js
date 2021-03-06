import R from 'ramda'

import targetingGroups from '../targetingGroups'
import { validate, rules } from './validation'

import toggleValue from '../utils/toggleValue'
import getData from '../utils/http'
import urls from '../../data/virkailijan-tyopoyta-urls.json'

// DELETE requests

function removeTargetingGroup (state, id) {
  console.log('Removing targeting group with id', id)

  const newTargetingGroups = targetingGroups.update(id, state.targetingGroups.items, {
    isRemoving: true,
    hasRemoveFailed: false
  })

  getData({
    url: `${urls['targeting.groups']}/${id}`,
    requestOptions: {
      method: 'DELETE'
    },
    onSuccess: () => targetingGroups.removeBus.push(id),
    onError: () => targetingGroups.removeFailedBus.push(id)
  })

  return R.assocPath(['targetingGroups', 'items'], newTargetingGroups, state)
}

// Updating state

function update (state, { prop, value }) {
  console.log('Updating release', prop, value)

  // Concatenate path and prop
  const path = ['editor', 'editedRelease']
  const concatenatedPath = R.is(Array, prop)
    ? path.concat(prop)
    : R.append(prop, path)

  const newState = R.assocPath(concatenatedPath, value, state)

  const validatedRelease = validate(
    R.path(path, newState),
    rules(newState)['release']
  )

  return R.assocPath(path, validatedRelease, state)
}

// Select categories, user groups and tags on toggling a targeting group
function toggleTargetingGroup (state, id) {
  const newId = state.editor.editedRelease.selectedTargetingGroup === id
    ? null
    : id

  const targetingGroup = R.find(R.propEq('id', id))(state.targetingGroups.items)

  // Select all targeting group's tags and tags in special tags' group
  const newTags = R.filter(
    tag => R.contains(tag, R.pluck('id', state.tagGroups.specialTags)),
    state.editor.editedRelease.notification.tags
  ).concat(targetingGroup.data.tags)

  const newState = newId
    ? R.compose(
      R.assocPath(['editor', 'editedRelease', 'categories'], targetingGroup.data.categories),
      R.assocPath(['editor', 'editedRelease', 'userGroups'], targetingGroup.data.userGroups),
      R.assocPath(['editor', 'editedRelease', 'notification', 'tags'], newTags)
    )(state)
    : state

  return update(newState, { prop: 'selectedTargetingGroup', value: newId })
}

// Remove selected tags from tag groups which aren't linked to selected categories
function removeSelectedTags (state) {
  const editedRelease = state.editor.editedRelease
  const selectedTags = editedRelease.notification.tags
  const selectedCategories = editedRelease.categories

  if (selectedCategories.length === 0) {
    return state
  }

  /*
   Get all tag IDs from tag groups which are linked to selected categories
   Always allow tags in state.tagGroups.specialTags
   */
  const allowedTags = R.pluck('id', R.flatten(R.pluck('tags',
    R.filter(group => !R.isEmpty(R.intersection(group.categories, selectedCategories)), state.tagGroups.items)
  ))).concat(R.pluck('id', state.tagGroups.specialTags))

  const newSelectedTags = R.filter(tag => R.contains(tag, allowedTags), selectedTags)
  const newState = R.assocPath(['editor', 'editedRelease', 'notification', 'tags'], newSelectedTags, state)

  return R.assocPath(
    ['editor', 'editedRelease'],
    validate(
      newState.editor.editedRelease,
      rules(newState)['release']
    ),
    newState
  )
}

function toggleCategory (state, category) {
  console.log('Toggling category with id', category)

  const categories = state.editor.editedRelease.categories
  const newCategories = R.contains(category, categories)
    ? R.reject(id => id === category, categories)
    : R.append(category, categories)

  removeSelectedGroups(state, newCategories)

  return removeSelectedTags(
    R.assocPath(['editor', 'editedRelease', 'categories'], newCategories, state),
    category
  )
}

// Remove selected user groups from tag groups which aren't linked to selected categories
function removeSelectedGroups (state, newCategories) {
  const editedRelease = state.editor.editedRelease
  const selectedGroups = editedRelease.userGroups

  if (selectedGroups.length === 0 || newCategories.length == 0) {
    return
  }

  const allowedGroups = R.pluck('id', R.flatten(
    R.filter(group => !R.isEmpty(R.intersection(group.categories, newCategories)), state.userGroups.items)
  )).concat([-1])

  const newSelectedGroups = R.filter(group => R.contains(group, allowedGroups), selectedGroups)

  if (selectedGroups.length != newSelectedGroups.length) {
    console.log('removed ' + (selectedGroups.length - newSelectedGroups.length) + ' selected group that were not in categories')
  }

  editedRelease.userGroups = newSelectedGroups
}

function toggleUserGroup (state, value) {
  const groups = state.editor.editedRelease.userGroups
  const newGroups = toggleValue(value, groups)

  return update(state, { prop: 'userGroups', value: newGroups })
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
      rules(newState)['release']
    ),
    newState
  )
}

function toggleSendEmail (state, value) {
  console.log('Toggled sendEmail', value)

  return update(state, { prop: ['notification', 'sendEmail'], value })
}

// Events for appState
const events = {
  update,
  toggleTargetingGroup,
  removeTargetingGroup,
  toggleCategory,
  toggleUserGroup,
  toggleTag,
  toggleSendEmail
}

const editRelease = {
  events,
  update,
  toggleTargetingGroup,
  removeTargetingGroup,
  toggleCategory,
  toggleUserGroup,
  toggleTag,
  toggleSendEmail
}

export default editRelease
