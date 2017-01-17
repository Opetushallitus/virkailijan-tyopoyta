import React, { PropTypes } from 'react'

import Button from '../common/buttons/Button'
import Translation from '../common/Translations'
import EditTimelineItem from './EditTimelineItem'

const propTypes = {
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  release: PropTypes.object.isRequired
}

function EditTimeline (props) {
  const {
    locale,
    dateFormat,
    controller,
    release
  } = props

  const handleOnAddItemClick = () => {
    controller.addTimelineItem(release)
  }

  return (
    <div>
      <h3 className="hide">
        <Translation trans="muokkaaaikajanantapahtumia" />
      </h3>

      {release.timeline.map((item, index) =>
        <EditTimelineItem
          key={item.id}
          item={item}
          locale={locale}
          dateFormat={dateFormat}
          controller={controller}
        />
      )}

      {/*Add new event*/}
      <Button className="button-link primary px0" onClick={handleOnAddItemClick}>
        <span aria-hidden>+ </span>
        <Translation trans="lisaauusitapahtuma" />
      </Button>
    </div>
  )
}

EditTimeline.propTypes = propTypes

export default EditTimeline
