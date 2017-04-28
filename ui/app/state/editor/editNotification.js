import R from 'ramda'

import { validate, rules } from './validation'

// Update methods

function update (state, { prop, value }) {
  console.log('Updating notification', prop, value)

  // Concatenate path and prop
  const path = ['editor', 'editedRelease', 'notification']
  const concatenatedPath = R.is(Array, prop)
    ? path.concat(prop)
    : R.append(prop, path)

  const validatedNotification = validate(
    R.path(path, R.assocPath(concatenatedPath, value, state)),
    rules(state)['notification']
  )

  const newState = R.assocPath(path, validatedNotification, state)

  // Also validate release when notification is updated, since release's validationState depends on the notification
  const validatedRelease = validate(
    newState.editor.editedRelease,
    rules(newState)['release']
  )

  return R.assocPath(
    ['editor', 'editedRelease'],
    validatedRelease,
    newState
  )
}

// Update content.{language}.{prop}
function updateContent (state, { prop, language, value }) {
  return update(state, { prop: ['content', language, prop], value })
}

// Initial state

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
    sendEmail: false,
    content: {
      fi: emptyContent(-1, 'fi'),
      sv: emptyContent(-1, 'sv')
    },
    tags: [],
    validationState: 'empty'
  }
}

const events = {
  update,
  updateContent
}

const editNotification = {
  events,
  emptyNotification,
  emptyContent,
  update,
  updateContent
}

export default editNotification
