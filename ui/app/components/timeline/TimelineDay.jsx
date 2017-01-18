import React, { PropTypes } from 'react'

import TimelineItem from './TimelineItem'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired
}

function TimelineDay (props) {
  const {
    controller,
    locale,
    dateFormat,
    items
  } = props

  const item = items[0]

  return (
    <div className="timeline-day relative col-12 sm-col-6 md-col-12 lg-col-6">
      <TimelineItem
        controller={controller}
        dateFormat={dateFormat}
        releaseId={item.releaseId}
        date={item.date}
        text={item.content[locale].text}
      />
    </div>
  )
}

TimelineDay.propTypes = propTypes

export default TimelineDay
