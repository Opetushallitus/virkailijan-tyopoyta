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

  const newState = R.assocPath(
    path,
    validate(
      R.path(path, R.assocPath(concatenatedPath, value, state)),
      rules(state.editor.editedRelease)['notification']
    ),
    state
  )

  // Empty tags if validationState is empty
  if (newState.validationState === 'empty') {
    newState.tags = []
  }

  return R.assocPath(
    ['editor', 'editedRelease'],
    validate(
      newState.editor.editedRelease,
      rules(newState.editor.editedRelease)['release']
    ),
    newState
  )
}

function updateTags (state, tags) {
  return R.assocPath()
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
  updateContent,
  updateTags
}

export default editNotification
