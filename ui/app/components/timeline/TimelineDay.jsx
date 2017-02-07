import React, { PropTypes } from 'react'

import TimelineItem from './TimelineItem'

const propTypes = {
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  onEditButtonClick: PropTypes.func.isRequired
}

function TimelineDay (props) {
  const {
    locale,
    dateFormat,
    items,
    onEditButtonClick
  } = props

  return (
    <div className="timeline-day relative col-12 sm-col-6 md-col-12 lg-col-6">
      {items.map((item, index) =>
        <TimelineItem
          key={`timelineItem${item.id}`}
          index={index}
          dateFormat={dateFormat}
          releaseId={item.releaseId}
          date={item.date}
          text={item.content[locale].text}
          onEditButtonClick={onEditButtonClick}
        />
      )}
    </div>
  )
}

TimelineDay.propTypes = propTypes

export default TimelineDay
