import React, { PropTypes } from 'react'

import Button from '../common/buttons/Button'
import EditTimelineItem from './EditTimelineItem'
import { translate } from '../common/Translations'

const propTypes = {
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  releaseId: PropTypes.number.isRequired,
  timeline: PropTypes.array.isRequired
}

function EditTimeline (props) {
  const {
    locale,
    dateFormat,
    controller,
    releaseId,
    timeline
  } = props

  const handleAddItemClick = () => {
    controller.add(releaseId, timeline)
  }

  return (
    <div>
      <h2 className="hide">{translate('aikajana')}</h2>

      {timeline.map((item, index) =>
        <EditTimelineItem
          key={`editTimelineItem${item.id}`}
          item={item}
          locale={locale}
          dateFormat={dateFormat}
          controller={controller}
        />
      )}

      {/*Add new event*/}
      <Button
        variants={['ghost']}
        className="regular px0"
        onClick={handleAddItemClick}
        data-selenium-id="add-timeline-item-button"
      >
        <span aria-hidden>+ </span>
        {translate('lisaauusitapahtuma')}
      </Button>
    </div>
  )
}

EditTimeline.propTypes = propTypes

export default EditTimeline
