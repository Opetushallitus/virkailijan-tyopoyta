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

function updateTags (state, value) {
  let newTags = value

  // Remove an already selected tag
  if (R.is(Number, value)) {
    console.log('Removing notification tag', value)
    newTags = state.editor.editedRelease.notification.tags.filter(tag => (tag !== value))
  }

  return update(state, { prop: 'tags', value: newTags })
}

function updateContent (state, { prop, language, value }) {
  return update(state, { prop: ['content', language, prop], value })
}

const events = {
  update,
  updateTags,
  updateContent
}

const editNotification = {
  events,
  update,
  updateTags,
  updateContent
}

export default editNotification
