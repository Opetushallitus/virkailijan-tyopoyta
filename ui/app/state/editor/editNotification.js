import R from 'ramda'

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
    createdAt: null,
    endDate: null,
    content: {
      fi: emptyContent(-1, 'fi'),
      sv: emptyContent(-1, 'sv')
    },
    tags: [],
    validationState: 'empty'
  }
}

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

function updateContent (state, { prop, language, value }) {
  return update(state, { prop: ['content', language, prop], value })
}

const events = {
  update,
  updateContent
}

const editNotification = {
  events,
  emptyNotification,
  update,
  updateContent
}

export default editNotification
