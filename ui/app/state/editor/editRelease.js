import R from 'ramda'

import editor from './editor'
import timeline from './editTimeline'
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

function emptyRelease () {
  return {
    id: -1,
    sendEmail: false,
    notification: emptyNotification(),
    timeline: [timeline.newItem(-1, [])],
    categories: [],
    userGroups: [],
    focusedCategory: null,
    focusedUserGroups: [],
    validationState: 'empty'
  }
}

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

function updateFocusedCategory (state, value) {
  return update(state, { prop: 'focusedCategory', value })
}

function toggleFocusedUserGroup (state, value) {
  const groups = state.editor.editedRelease.focusedUserGroups
  const newGroups = editor.toggleValue(value, groups)

  return update(state, { prop: 'focusedUserGroups', value: newGroups })
}

// Events for appState
const events = {
  toggleCategory,
  toggleUserGroup,
  updateFocusedCategory,
  toggleFocusedUserGroup
}

const editRelease = {
  events,
  emptyRelease,
  toggleCategory,
  toggleUserGroup,
  updateFocusedCategory,
  toggleFocusedUserGroup
}

export default editRelease
