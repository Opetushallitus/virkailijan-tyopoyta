import R from 'ramda'

// Returns timeline items with defined state(s)
const getTimelineItems = (state, timeline) => {
  const hasState = item => {
    item.validationState = item.validationState || 'complete'

    return R.contains(item.validationState, state)
  }

  return R.filter(hasState, timeline)
}

export default getTimelineItems
