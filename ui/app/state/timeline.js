import R from 'ramda'
import Bacon from 'baconjs'
import moment from 'moment'

import view from './view'
import notifications from './notifications'
import editor from './editor/editor'
import getData from '../utils/getData'
import createAlert from '../utils/createAlert'

const url = '/virkailijan-tyopoyta/api/timeline'

const fetchBus = new Bacon.Bus()
const fetchFailedBus = new Bacon.Bus()

function fetch (options) {
  console.log('Fetching timeline')

  const {
    month,
    year
  } = options

  getData({
    url: url,
    searchParams: {
      month,
      year
    },
    onSuccess: timeline => fetchBus.push(timeline),
    onError: (error) => fetchFailedBus.push(error)
  })
}

function onCurrentMonthReceived (state, response) {
  const currentDate = new Date()
  const currentDay = currentDate.getUTCDate()
  const isCurrentDayOrAfter = (value, key) => key >= currentDay

  // Get month's current day and the days after it
  const visibleDays = R.pickBy(isCurrentDayOrAfter, response.days)
  const visibleMonth = R.assoc('days', visibleDays, response)
  const count = Object.keys(visibleDays).length

  // Get month's past days
  const pastDays = R.omit(Object.keys(visibleDays), response.days)
  const partOfMonth = R.assoc('part', 2, response)
  const pastMonth = R.assoc('days', pastDays, partOfMonth)

  const newState = R.assocPath(['timeline', 'preloadedItems'], [pastMonth], state)
  const stateWithCount = R.assocPath(['timeline', 'count'], count, newState)
  const stateWithoutLoading = R.assocPath(['timeline', 'isLoadingNext'], false, stateWithCount)

  return R.assocPath(['timeline', 'items'], [visibleMonth], stateWithoutLoading)
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

  const newCount = () => {
    const count = Object.keys(response.days).length || 1
    return timeline.count + count
  }

  const stateWithCount = R.assocPath(['timeline', 'count'], newCount(), state)

  // Returned date is before first month and year
  if (requestedDateMoment.isBefore(firstMonthMoment)) {
    const newState = R.assocPath(['timeline', 'direction'], 'up', stateWithCount)
    const stateWithoutLoading = R.assocPath(['timeline', 'isLoadingPrevious'], false, newState)

    const newItems = R.prepend(response, timeline.items)

    return R.assocPath(['timeline', 'items'], newItems, stateWithoutLoading)
  } else {
    // Returned date is after last month and year

    const newState = R.assocPath(['timeline', 'direction'], 'down', stateWithCount)
    const stateWithoutLoading = R.assocPath(['timeline', 'isLoadingNext'], false, newState)

    const newItems = R.append(response, timeline.items)

    return R.assocPath(['timeline', 'items'], newItems, stateWithoutLoading)
  }
}

function onReceived (state, response) {
  console.log('Received timeline')

  const timeline = state.timeline
  const dateFormat = timeline.dateFormat

  const newState = R.assocPath(['timeline', 'hasLoadingFailed'], false, state)
  const stateWithoutLoading = R.assocPath(['timeline', 'isInitialLoad'], false, newState)

  if (timeline.isInitialLoad) {
    return onCurrentMonthReceived(stateWithoutLoading, response)
  } else {
    return onNewMonthReceived(stateWithoutLoading, {
      response,
      dateFormat,
      timeline
    })
  }
}

function onFailed (state) {
  const alert = createAlert({
    type: 'error',
    title: 'Tapahtumien haku epäonnistui',
    text: 'Päivitä sivu hakeaksesi uudelleen'
  })

  const newState = R.assocPath(['timeline', 'isLoadingNext'], false, state)
  const stateWithoutLoadingPrevious = R.assocPath(['timeline', 'isLoadingPrevious'], false, newState)
  const stateWithFailedTimeline = R.assocPath(['timeline', 'hasLoadingFailed'], true, stateWithoutLoadingPrevious)
  const stateIsReady = R.assocPath(['timeline', 'isInitialLoad'], false, stateWithFailedTimeline)

  view.alertsBus.push(alert)

  return stateIsReady
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
   Example, subtract 1 month from January 2017 = December 2016
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
  const newState = R.assocPath(['timeline', 'direction'], 'up', state)
  const stateWithoutPreloadedItems = R.assocPath(['timeline', 'preloadedItems'], [], newState)

  return R.assocPath(['timeline', 'items'], newItems, stateWithoutPreloadedItems)
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

function getRelatedNotification (state, id) {
  return notifications.getNotificationById(state, id)
}

function edit (state, releaseId) {
  console.log('Editing timeline item with release id ', releaseId)

  return editor.open(state, null, releaseId, 'edit-timeline')
}

function emptyTimeline () {
  return {
    items: [],
    preloadedItems: [],
    count: 0,
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
  edit
}

const initialState = emptyTimeline()

const timeline = {
  fetchBus,
  fetchFailedBus,
  events,
  initialState,
  onReceived,
  onFailed,
  fetch,
  getCurrentMonth,
  getPreloadedMonth,
  getPreviousMonth,
  getNextMonth,
  getRelatedNotification,
  edit,
  emptyTimeline
}

export default timeline
