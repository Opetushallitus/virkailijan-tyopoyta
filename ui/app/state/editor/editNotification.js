import R from 'ramda'

import { validate, rules } from './validation'

function update (state, {prop, value}) {
  console.log('Updating notification', prop, value)

  // Concatenate path and prop
  let path = ['editor', 'editedRelease', 'notification']
  const concatenatedPath = R.is(Array, prop)
    ? path.concat(prop)
    : R.append(prop, path)

  const newState = R.assocPath(concatenatedPath, value, state)

  // Validate notification
  const validatedNotification = validate(R.path(path, newState), rules['notification'])

  return R.assocPath(path, validatedNotification, state)
}

function toggleTag (state, id) {
  console.log('Toggled tag with id', id)

  const selectedTags = state.editor.editedRelease.notification.tags
  const newSelectedTags = R.contains(id, selectedTags)
    ? R.reject(selected => selected === id, selectedTags)
    : R.append(id, selectedTags)

  return setSelectedTags(state, newSelectedTags)
}

function setSelectedTags (state, selected) {
  return update(state, { prop: 'tags', value: selected })
}

function updateContent (state, { prop, language, value }) {
  return update(state, { prop: ['content', language, prop], value })
}

const events = {
  update,
  toggleTag,
  setSelectedTags,
  updateContent
}

const editNotification = {
  events,
  update,
  toggleTag,
  setSelectedTags,
  updateContent
}

export default editNotification
