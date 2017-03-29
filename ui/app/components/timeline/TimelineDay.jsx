import React, { PropTypes } from 'react'

import TimelineItem from './TimelineItem'

const propTypes = {
  id: PropTypes.string.isRequired,
  defaultLocale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  onDisplayRelatedNotificationLinkClick: PropTypes.func.isRequired,
  onEditButtonClick: PropTypes.func.isRequired,
  onConfirmRemoveButtonClick: PropTypes.func.isRequired
}

function TimelineDay (props) {
  const {
    id,
    defaultLocale,
    dateFormat,
    user,
    items,
    onDisplayRelatedNotificationLinkClick,
    onEditButtonClick,
    onConfirmRemoveButtonClick
  } = props

  return (
    <div id={id} className="timeline-day relative col-12 sm-col-6 md-col-12 lg-col-6">
      {items.map((item, index) =>
        <TimelineItem
          key={`timelineItem${item.id}Release${item.releaseId}`}
          htmlId={`timeline-item${item.id}-release${item.releaseId}`}
          dayId={id}
          index={index}
          defaultLocale={defaultLocale}
          dateFormat={dateFormat}
          user={user}
          item={item}
          onDisplayRelatedNotificationLinkClick={onDisplayRelatedNotificationLinkClick}
          onEditButtonClick={onEditButtonClick}
          onConfirmRemoveButtonClick={onConfirmRemoveButtonClick}
        />
      )}
    </div>
  )
}

TimelineDay.propTypes = propTypes

export default TimelineDay
