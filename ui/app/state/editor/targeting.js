import R from 'ramda'
import Bacon from 'baconjs'

import editor from './editor'
import { validate, rules } from './validation'
import getData from '../../utils/getData'
import urls from '../../data/virkailijan-tyopoyta-urls.json'

const removeTargetingGroupBus = new Bacon.Bus()
const removeTargetingGroupFailedBus = new Bacon.Bus()

function onTargetingGroupRemoved (state, id) {
  const newTargetingGroups = R.reject(targetingGroup => targetingGroup.id === id, state.user.targetingGroups)

  return R.assocPath(['user', 'targetingGroups'], newTargetingGroups, state)
}

function onRemoveTargetingGroupFailed (state, id) {
  const newTargetingGroups = updateTargetingGroups(id, state.user.targetingGroups, {
    isLoading: false,
    hasLoadingFailed: true
  })

  return R.assocPath(['user', 'targetingGroups'], newTargetingGroups, state)
}

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

  return editor.saveDraft(R.assocPath(path, validatedRelease, state))
}

function updateTargetingGroups (id, targetingGroups, options) {
  const targetingGroup = R.find(R.propEq('id', id))(targetingGroups)
  const index = R.findIndex(R.propEq('id', id))(targetingGroups)

  const newTargetingGroup = R.compose(
    R.assoc('isLoading', options.isLoading),
    R.assoc('hasLoadingFailed', options.hasLoadingFailed)
  )(targetingGroup)

  return [
    ...targetingGroups.slice(0, index),
    newTargetingGroup,
    ...targetingGroups.slice(index + 1)
  ]
}

function toggleTargetingGroup (state, id) {
  const newId = state.editor.editedRelease.selectedTargetingGroup === id
    ? null
    : id

  const targetingGroup = R.find(R.propEq('id', id))(state.user.targetingGroups)

  // Select all targeting group's tags and tags in special tags' group
  const newTags = R.filter(
    tag => R.contains(tag, R.pluck('id', state.tagGroups.specialTags)),
    state.editor.editedRelease.notification.tags
  ).concat(targetingGroup.tags)

  const newState = newId
    ? R.compose(
      R.assocPath(['editor', 'editedRelease', 'categories'], targetingGroup.categories),
      R.assocPath(['editor', 'editedRelease', 'userGroups'], targetingGroup.userGroups),
      R.assocPath(['editor', 'editedRelease', 'notification', 'tags'], newTags)
    )(state)
    : state

  return update(newState, { prop: 'selectedTargetingGroup', value: newId })
}

function removeTargetingGroup (state, id) {
  console.log('Removing targeting group with id', id)

  const newTargetingGroups = updateTargetingGroups(id, state.user.targetingGroups, {
    isLoading: true,
    hasLoadingFailed: false
  })

  getData({
    url: `${urls['targeting.groups']}/${id}`,
    requestOptions: {
      method: 'DELETE'
    },
    onSuccess: () => removeTargetingGroupBus.push(id),
    onError: () => removeTargetingGroupFailedBus.push(id)
  })

  return R.assocPath(['user', 'targetingGroups'], newTargetingGroups, state)
}

function toggleCategory (state, category) {
  console.log('Toggling category with id', category)

  const categories = state.editor.editedRelease.categories
  const newCategories = R.contains(category, categories)
    ? R.reject(id => id === category, categories)
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
    R.filter(group => R.length(R.intersection(group.categories, selectedCategories)), state.tagGroups.items)
  ))).concat(R.pluck('id', state.tagGroups.specialTags))

  const newSelectedTags = R.filter(tag => R.contains(tag, allowedTags), selectedTags)
  const newState = R.assocPath(['editor', 'editedRelease', 'notification', 'tags'], newSelectedTags, state)

  return editor.saveDraft(R.assocPath(
    ['editor', 'editedRelease'],
    validate(
      newState.editor.editedRelease,
      rules(newState)['release']
    ),
    newState
  ))
}

function toggleTag (state, id) {
  console.log('Toggled tag with id ' + id)

  const selectedTags = state.editor.editedRelease.notification.tags
  const newSelectedTags = R.contains(id, selectedTags)
    ? R.reject(selected => selected === id, selectedTags)
    : R.append(id, selectedTags)

  const newState = R.assocPath(['editor', 'editedRelease', 'notification', 'tags'], newSelectedTags, state)

  return editor.saveDraft(R.assocPath(
    ['editor', 'editedRelease'],
    validate(
      newState.editor.editedRelease,
      rules(newState)['release']
    ),
    newState
  ))
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
  removeTargetingGroupBus,
  removeTargetingGroupFailedBus,
  onTargetingGroupRemoved,
  onRemoveTargetingGroupFailed,
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
