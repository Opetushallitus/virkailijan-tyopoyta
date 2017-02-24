import React, { PropTypes } from 'react'

import Button from '../common/buttons/Button'
import Translation from '../common/Translations'
import EditTimelineItem from './EditTimelineItem'

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
      <h3 className="hide">
        <Translation trans="muokkaaaikajanantapahtumia" />
      </h3>

      {timeline.map((item, index) =>
        <EditTimelineItem
          key={item.id}
          item={item}
          locale={locale}
          dateFormat={dateFormat}
          controller={controller}
        />
      )}

      {/*Add new event*/}
      <Button className="button-link regular px0" onClick={handleAddItemClick}>
        <span aria-hidden>+ </span>
        <Translation trans="lisaauusitapahtuma" />
      </Button>
    </div>
  )
}

EditTimeline.propTypes = propTypes

export default EditTimeline
