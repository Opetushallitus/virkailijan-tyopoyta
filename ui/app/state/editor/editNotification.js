import R from 'ramda'

import targeting from './targeting'
import { validate, rules } from './validation'

function emptyContent (id, language) {
  return {
    notificationId: id,
    text: '',
    title: '',
    language
  }
}

function emptyNotification () {
  return {
    id: -1,
    releaseId: -1,
    startDate: null,
    endDate: null,
    content: {
      fi: emptyContent(-1, 'fi'),
      sv: emptyContent(-1, 'sv')
    },
    tags: [],
    validationState: 'empty'
  }
}

function update (state, { prop, value }) {
  console.log('Updating notification', prop, value)

  // Concatenate path and prop
  let path = ['editor', 'editedRelease', 'notification']
  const concatenatedPath = R.is(Array, prop)
    ? path.concat(prop)
    : R.append(prop, path)

  const validatedNotification = validate(
    R.path(path, R.assocPath(concatenatedPath, value, state)),
    rules(state.editor.editedRelease)['notification']
  )

  // Remove all tags except those in state.tags.specialTags if notification is emptied
  const specialTagIds = R.pluck('id', state.tags.specialTags)

  if (validatedNotification.validationState === 'empty') {
    validatedNotification.tags = R.filter(tag => R.contains(tag, specialTagIds), validatedNotification.tags)
  }

  const newState = R.assocPath(path, validatedNotification, state)

  return R.assocPath(
    ['editor', 'editedRelease'],
    validate(
      newState.editor.editedRelease,
      rules(newState.editor.editedRelease)['release']
    ),
    newState
  )
}

function updateContent (state, { prop, language, value }) {
  return update(state, { prop: ['content', language, prop], value })
}

function setAsDisruptionNotification (state, id) {
  return targeting.toggleTag(state, id)
}

const events = {
  update,
  updateContent,
  setAsDisruptionNotification
}

const editNotification = {
  events,
  emptyNotification,
  update,
  updateContent,
  setAsDisruptionNotification
}

export default editNotification
