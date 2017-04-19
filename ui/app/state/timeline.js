import R from 'ramda'
import Bacon from 'baconjs'
import moment from 'moment'

import view from './view'
import notifications from './notifications/notifications'
import editor from './editor/editor'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'
import urls from '../data/virkailijan-tyopoyta-urls.json'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()
const removeItemBus = new Bacon.Bus()

function fetch (options) {
  console.log('Fetching timeline')

  const {
    month,
    year
  } = options

  getData({
    url: urls.timeline,
    searchParams: {
      month,
      year
    },
    onSuccess: timeline => fetchBus.push(timeline),
    onError: (error) => fetchFailedBus.push(error)
  })
}

function onReceived (state, response) {
  console.log('Received timeline')

  const timeline = state.timeline
  const dateFormat = timeline.dateFormat

  const newState = R.compose(
    R.assocPath(['timeline', 'hasLoadingFailed'], false),
    R.assocPath(['timeline', 'isInitialLoad'], false),
  )(state)

  if (timeline.isInitialLoad) {
    return onCurrentMonthReceived(newState, response)
  } else {
    return onNewMonthReceived(newState, {
      response,
      dateFormat,
      timeline
    })
  }
}

function onFetchFailed (state) {
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

function autoFetchNextMonth (state, timelineViewport, spinner) {
  // Check if spinner is visible in the viewport
  const offset = spinner.getBoundingClientRect()

  const isSpinnerVisible = offset.bottom > 0 && offset.top < timelineViewport.clientHeight

  if (isSpinnerVisible) {
    getNextMonth(state)
  }
}

function onItemRemoved (state, { result, nodeSelector, parentSelector }) {
  const alert = createAlert({
    variant: 'success',
    titleKey: 'tapahtumapoistettu'
  })

  const timelineViewport = document.querySelector('.timeline-viewport')
  const nextMonthSpinner = document.querySelector('.timeline-next-month-spinner')
  const node = document.querySelector(nodeSelector)
  const overlay = document.querySelector(`${nodeSelector}-overlay`)
  const parent = document.querySelector(parentSelector)

  if (result) {
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
  } else {
    alert.variant = 'error'
    alert.titleKey = 'tapahtumanpoistoepaonnistui'

    setTimeout(() => {
      node.style.opacity = 1
      overlay.classList.add('display-none')
    }, 500)
  }

  view.alertsBus.push(alert)

  return state
}

function onCurrentMonthReceived (state, response) {
  const currentDate = new Date()
  const currentDay = currentDate.getUTCDate()
  const isCurrentDayOrAfter = (value, key) => key >= currentDay

  // Get month's current day and the days after it
  const currentAndComingDays = R.pickBy(isCurrentDayOrAfter, response.days)

  // Display only current and coming days for the current month
  const currentMonthsVisibleDays = R.assoc('days', currentAndComingDays, response)

  // Get month's past days
  const currentMonthsPastDays = R.assoc(
    'days',
    // Past days
    R.omit(R.keys(currentAndComingDays), response.days),
    // Is part 2 of current month
    R.assoc('part', 2, response)
  )

  return R.compose(
    R.assocPath(['timeline', 'items'], [currentMonthsVisibleDays]),
    R.assocPath(['timeline', 'preloadedItems'], [currentMonthsPastDays]),
    R.assocPath(['timeline', 'isLoadingNext'], false)
  )(state)
}

function onNewMonthReceived (state, options) {
  const {
    response,
    dateFormat,
    timeline
  } = options

  const requestedDateMoment = moment(`${response.month}.${response.year}`, dateFormat)

  const firstMonth = R.head(timeline.items)
  const firstMonthMoment = moment(`${firstMonth.month}.${firstMonth.year}`, dateFormat)

  // Returned date is before first month and year - prepend new items to timeline.items
  if (requestedDateMoment.isBefore(firstMonthMoment)) {
    return R.compose(
      R.assocPath(['timeline', 'items'], R.prepend(response, timeline.items)),
      R.assocPath(['timeline', 'direction'], 'up'),
      R.assocPath(['timeline', 'isLoadingPrevious'], false)
    )(state)
  } else {
    // Returned date is after last month and year - append new items to timeline.items
    return R.compose(
      R.assocPath(['timeline', 'items'], R.append(response, timeline.items)),
      R.assocPath(['timeline', 'direction'], 'down'),
      R.assocPath(['timeline', 'isLoadingNext'], false)
    )(state)
  }
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

function getCurrentMonth (state) {
  const month = moment().format('M')
  const year = moment().format('YYYY')

  fetch({
    month,
    year
  })

  return R.assocPath(['timeline', 'isLoadingNext'], true, state)
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

function getRelatedNotification (state, notificationId) {
  return notifications.getNotificationById(state, notificationId)
}

function edit (state, releaseId) {
  console.log('Editing timeline item with release id ', releaseId)

  return editor.open(state, null, releaseId, 'edit-timeline')
}

function confirmRemove (state, { id, nodeSelector, parentSelector }) {
  console.log('Removing timeline item with id', id)

  getData({
    url: `${urls.timeline}/${id}`,
    requestOptions: {
      method: 'DELETE'
    },
    onSuccess: () => removeItemBus.push({
      result: true,
      nodeSelector,
      parentSelector
    }),
    onError: () => removeItemBus.push({
      result: false,
      nodeSelector,
      parentSelector
    })
  })

  return state
}

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
  getCurrentMonth,
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
  removeItemBus,
  events,
  initialState,
  onReceived,
  onFetchFailed,
  onItemRemoved,
  fetch,
  getCurrentMonth,
  getPreloadedMonth,
  getPreviousMonth,
  getNextMonth,
  getRelatedNotification,
  edit,
  confirmRemove,
  emptyTimeline
}

export default timeline
