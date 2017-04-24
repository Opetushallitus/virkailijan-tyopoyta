import R from 'ramda'
import Bacon from 'baconjs'
import moment from 'moment'

import view from './view'
import notifications from './notifications/notifications'
import editor from './editor/editor'
import http from './utils/http'
import createAlert from './utils/createAlert'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()
const itemRemovedBus = new Bacon.Bus()
const removeItemFailedBus = new Bacon.Bus()

// GET requests

function fetch (options) {
  console.log('Fetching timeline')

  const {
    month,
    year
  } = options

  http({
    url: urls.timeline,
    searchParams: {
      month,
      year
    },
    onSuccess: timeline => fetchBus.push(timeline),
    onError: (error) => fetchFailedBus.push(error)
  })
}

function onReceived (state, timeline) {
  console.log('Received timeline')

  const dateFormat = state.timeline.dateFormat
  const newState = R.compose(
    R.assocPath(['timeline', 'hasLoadingFailed'], false),
    R.assocPath(['timeline', 'isInitialLoad'], false),
  )(state)

  if (state.timeline.isInitialLoad) {
    return onCurrentMonthReceived(newState, timeline)
  } else {
    return onNewMonthReceived(newState, { timeline, dateFormat })
  }
}

function onCurrentMonthReceived (state, timeline) {
  console.log('Received current month')

  const currentDate = new Date()
  const currentDay = currentDate.getUTCDate()
  const isCurrentDayOrAfter = (value, key) => key >= currentDay

  // Get month's current day and the days after it
  const currentAndComingDays = R.pickBy(isCurrentDayOrAfter, timeline.days)

  // Display only current and coming days for the current month
  const currentMonthsVisibleDays = R.assoc('days', currentAndComingDays, timeline)

  // Get month's past days
  const currentMonthsPastDays = R.assoc(
    'days',
    // Past days
    R.omit(R.keys(currentAndComingDays), timeline.days),
    // Is part 2 of current month
    R.assoc('part', 2, timeline)
  )

  return R.compose(
    R.assocPath(['timeline', 'items'], [currentMonthsVisibleDays]),
    R.assocPath(['timeline', 'preloadedItems'], [currentMonthsPastDays]),
    R.assocPath(['timeline', 'isLoadingNext'], false)
  )(state)
}

function onNewMonthReceived (state, { timeline, dateFormat }) {
  console.log('Received new month')

  const receivedDateMoment = moment(`${timeline.month}.${timeline.year}`, dateFormat)

  const firstMonth = R.head(state.timeline.items)
  const firstMonthMoment = moment(`${firstMonth.month}.${firstMonth.year}`, dateFormat)

  // Received date is before first month and year - prepend new items to timeline.items
  if (receivedDateMoment.isBefore(firstMonthMoment)) {
    return R.compose(
      R.assocPath(['timeline', 'items'], R.prepend(timeline, state.timeline.items)),
      R.assocPath(['timeline', 'direction'], 'up'),
      R.assocPath(['timeline', 'isLoadingPrevious'], false)
    )(state)
  } else {
    // Received date is after last month and year - append new items to timeline.items
    return R.compose(
      R.assocPath(['timeline', 'items'], R.append(timeline, state.timeline.items)),
      R.assocPath(['timeline', 'direction'], 'down'),
      R.assocPath(['timeline', 'isLoadingNext'], false)
    )(state)
  }
}

function onFetchFailed (state) {
  console.error('Fetching timeline failed')

  const alert = createAlert({
    variant: 'error',
    titleKey: 'tapahtumienhakuepaonnistui',
    textKey: 'paivitasivu'
  })

  view.alertsBus.push(alert)

  return R.compose(
    R.assocPath(['timeline', 'isLoadingNext'], false),
    R.assocPath(['timeline', 'isLoadingPrevious'], false),
    R.assocPath(['timeline', 'hasLoadingFailed'], true),
    R.assocPath(['timeline', 'isInitialLoad'], false)
  )(state)
}

/*
 Returns an object with manipulated month and year
 Manipulation is done with Moment.js: http://momentjs.com/docs/#/manipulating/
 */
function getManipulatedMonthAndYear (options) {
  const {
    month,
    year,
    action,
    amount
  } = options

  /*
   Example: subtract 1 month from January 2017 = December 2016
   moment('1.2017', 'M.YYYY')['subtract'](1, 'months')
   */
  const newDate = moment(`${month}.${year}`, 'M.YYYY')[action](amount, 'months')

  return {
    month: newDate.format('M'),
    year: newDate.format('YYYY')
  }
}

function getNextMonth (state) {
  // Check if next month is already being fetched
  if (state.timeline.isLoadingNext) {
    return state
  }

  const timeline = state.timeline
  const lastMonth = R.last(timeline.items)

  if (!lastMonth) {
    return getCurrentMonth(state)
  }

  const nextMonthAndYear = getManipulatedMonthAndYear({
    month: lastMonth.month,
    year: lastMonth.year,
    action: 'add',
    amount: 1
  })

  console.log('Get next month', nextMonthAndYear.month, nextMonthAndYear.year)

  fetch(nextMonthAndYear)

  return R.assocPath(['timeline', 'isLoadingNext'], true, state)
}

function getPreviousMonth (state) {
  // Check if previous month is already being fetched
  if (state.timeline.isLoadingPrevious) {
    return state
  }

  const timeline = state.timeline
  const firstMonth = R.head(timeline.items)

  const previousMonthAndYear = getManipulatedMonthAndYear({
    month: firstMonth.month,
    year: firstMonth.year,
    action: 'subtract',
    amount: 1
  })

  console.log('Get previous month', previousMonthAndYear.month, previousMonthAndYear.year)

  fetch(previousMonthAndYear)

  return R.assocPath(['timeline', 'isLoadingPrevious'], true, state)
}

function getCurrentMonth (state) {
  const month = moment().format('M')
  const year = moment().format('YYYY')

  fetch({
    month,
    year
  })

  return R.assocPath(['timeline', 'isLoadingNext'], true, state)
}

function autoFetchNextMonth (state, timelineViewport, spinner) {
  // Check if spinner is visible in the viewport
  const offset = spinner.getBoundingClientRect()

  const isSpinnerVisible = offset.bottom > 0 && offset.top < timelineViewport.clientHeight

  if (isSpinnerVisible) {
    getNextMonth(state)
  }
}

function edit (state, releaseId) {
  console.log('Editing timeline item with release id ', releaseId)

  return editor.open(state, null, releaseId, 'edit-timeline')
}

function getRelatedNotification (state, notificationId) {
  return notifications.getNotificationById(state, notificationId)
}

// DELETE requests

function confirmRemove (state, { id, nodeSelector, parentSelector }) {
  console.log('Removing timeline item with id', id)

  http({
    url: `${urls.timeline}/${id}`,
    requestOptions: {
      method: 'DELETE'
    },
    onSuccess: () => itemRemovedBus.push({ nodeSelector, parentSelector }),
    onError: () => removeItemFailedBus.push({ nodeSelector, parentSelector })
  })

  return state
}

function onItemRemoved (state, { nodeSelector, parentSelector }) {
  console.log('Timeline item removed')

  const alert = createAlert({
    variant: 'success',
    titleKey: 'tapahtumapoistettu'
  })

  const timelineViewport = document.querySelector('.timeline-viewport')
  const nextMonthSpinner = document.querySelector('.timeline-next-month-spinner')
  const node = document.querySelector(nodeSelector)
  const parent = document.querySelector(parentSelector)

  view.alertsBus.push(alert)

  // Fade out the deleted timeline item's DOM node and fetch next month if necessary
  setTimeout(() => {
    node.style.opacity = 0
  }, 500)

  setTimeout(() => {
    if (parent.children.length === 1) {
      parent.remove()
    } else {
      node.remove()
    }

    autoFetchNextMonth(state, timelineViewport, nextMonthSpinner)
  }, 1000)

  return state
}

function onRemoveItemFailed (state, { nodeSelector, parentSelector }) {
  console.error('Removing timeline item failed')

  const node = document.querySelector(nodeSelector)
  const overlay = document.querySelector(`${nodeSelector}-overlay`)

  const alert = createAlert({
    variant: 'error',
    titleKey: 'tapahtumanpoistoepaonnistui'
  })

  view.alertsBus.push(alert)

  // Reset DOM node's opacity and hide overlay
  setTimeout(() => {
    node.style.opacity = 1
    overlay.classList.add('display-none')
  }, 500)

  return state
}

// Updating state

function getPreloadedMonth (state) {
  console.log('Get preloaded month')

  const timeline = state.timeline
  const newItems = R.concat(timeline.preloadedItems, timeline.items)

  return R.compose(
    R.assocPath(['timeline', 'direction'], 'up'),
    R.assocPath(['timeline', 'preloadedItems'], []),
    R.assocPath(['timeline', 'items'], newItems)
  )(state)
}

// Initial state

function emptyTimeline () {
  return {
    items: [],
    preloadedItems: [],
    dateFormat: 'M.YYYY',
    isLoadingNext: false,
    isLoadingPrevious: false,
    isInitialLoad: true,
    hasLoadingFailed: false
  }
}

// Events for appState
const events = {
  getPreloadedMonth,
  getNextMonth,
  getPreviousMonth,
  getRelatedNotification,
  edit,
  confirmRemove
}

const initialState = emptyTimeline()

const timeline = {
  fetchBus,
  fetchFailedBus,
  itemRemovedBus,
  removeItemFailedBus,
  events,
  initialState,
  onReceived,
  onFetchFailed,
  onItemRemoved,
  onRemoveItemFailed,
  fetch,
  getPreloadedMonth,
  getPreviousMonth,
  getNextMonth,
  getRelatedNotification,
  edit,
  confirmRemove
}

export default timeline
