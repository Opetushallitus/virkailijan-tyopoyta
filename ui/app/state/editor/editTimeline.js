import R from 'ramda'

import { validate, rules } from './validation'

// Returns last timeline item's id - 1
function getItemId (timeline) {
  return R.dec(R.prop('id', R.last(timeline)))
}

function emptyContent (id, language) {
  return {
    timelineId: id,
    language,
    text: ''
  }
}

function newItem (releaseId, timeline) {
  // id must be a negative int on new items
  const id = R.length(R.filter(item => item.id < 0, timeline))
    ? getItemId(timeline)
    : -1

  return {
    id,
    releaseId,
    initialDate: null,
    date: null,
    content: {
      fi: emptyContent(id, 'fi'),
      sv: emptyContent(id, 'sv')
    },
    validationState: 'empty'
  }
}

function update (state, timeline) {
  return R.assocPath(['editor', 'editedRelease', 'timeline'], timeline, state)
}

function updateItem (state, { id, prop, value }) {
  console.log('Updating timeline item', id, prop, value);

  const timeline = state.editor.editedRelease.timeline
  const index = R.findIndex(R.propEq('id', id), timeline)
  const item = R.find(R.propEq('id', id), timeline)

  const newTimelineItem = R.is(Array, prop)
    ? R.assocPath(prop, value, item)
    : R.assoc(prop, value, item)

  const newTimeline = [
    ...timeline.slice(0, index),
    validate(newTimelineItem, rules(state.editor.editedRelease)['timelineItem']),
    ...timeline.slice(index + 1)
  ]

  return update(state, newTimeline)
}

function updateContent (state, { id, language, prop, value }) {
  return updateItem(state, {id, prop: ['content', language, prop], value})
}

function add (state, { releaseId, timeline }) {
  const item = newItem(releaseId, timeline)
  const newTimeline = R.append(item, timeline.slice())

  console.log('Adding new timeline item with id', item.id)

  return update(state, newTimeline)
}

function remove (state, id) {
  console.log('Removing new timeline item with id', id)

  const timeline = state.editor.editedRelease.timeline
  const index = R.findIndex(R.propEq('id', id), timeline)

  const newTimeline = [
    ...timeline.slice(0, index),
    ...timeline.slice(index + 1)
  ]

  return update(state, newTimeline)
}

const events = {
  updateItem,
  updateContent,
  add,
  remove
}

const editTimeline = {
  events,
  emptyContent,
  newItem,
  updateItem,
  updateContent,
  add,
  remove
}

export default editTimeline
