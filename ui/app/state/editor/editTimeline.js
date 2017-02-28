import R from 'ramda'

import { validate, rules } from './validation'

// Returns last timeline item's ID + 1
function getItemId (timeline) {
  return R.inc(R.prop('id', R.last(timeline)))
}

function newItem (releaseId, timeline) {
  const id = timeline.length
    ? getItemId(timeline)
    : 1

  return {
    id: id,
    releaseId: releaseId,
    initialDate: null,
    date: null,
    content: {
      fi: {timelineId: id, language: 'fi', text: ''},
      sv: {timelineId: id, language: 'sv', text: ''}
    },
    validationState: 'empty'
  }
}

function update (state, { id, prop, value }) {
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

  return R.assocPath(['editor', 'editedRelease', 'timeline'], newTimeline, state)
}

function updateContent (state, { id, language, prop, value }) {
  return update(state, {id, prop: ['content', language, prop], value})
}

function add (state, { releaseId, timeline }) {
  const item = newItem(releaseId, timeline)
  const newTimeline = R.append(item, timeline.slice())

  console.log('Adding new timeline item with id', item.id)

  return R.assocPath(['editor', 'editedRelease', 'timeline'], newTimeline, state)
}

function remove (state, id) {
  console.log('Removing new timeline item with id', id)

  const timeline = state.editor.editedRelease.timeline
  const index = R.findIndex(R.propEq('id', id), timeline)

  const newTimeline = [
    ...timeline.slice(0, index),
    ...timeline.slice(index + 1)
  ]

  return R.assocPath(['editor', 'editedRelease', 'timeline'], newTimeline, state)
}

const events = {
  update,
  updateContent,
  add,
  remove
}

const editTimeline = {
  events,
  newItem,
  update,
  updateContent,
  add,
  remove
}

export default editTimeline
