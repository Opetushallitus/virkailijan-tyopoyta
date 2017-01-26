import React, { PropTypes } from 'react'
import moment from 'moment'
import renderHTML from 'react-render-html'

import EditButton from '../common/buttons/EditButton'

// TODO: Move localization to properties file
const localization = {
  'Wednesday': 'keskiviikko',
  'February': 'helmikuu'
}

const propTypes = {
  controller: PropTypes.object.isRequired,
  releaseId: PropTypes.number.isRequired,
  dateFormat: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
}

function TimelineItem (props) {
  const {
    controller,
    releaseId,
    dateFormat,
    date,
    text
  } = props

  const handleOnEditButtonClick = () => {
    controller.toggleEditor(releaseId, 'edit-timeline')
  }

  const momentDate = moment(date, dateFormat)
  const dayOfMonth = momentDate.format('D')
  const dayOfWeek = momentDate.format('dddd')
  const month = momentDate.format('MMMM')
  const year = momentDate.format('YYYY')

  return (
    <div className="timeline-item break-word left-align p2 relative rounded white bg-blue">
      {/*Date*/}
      <time className="mb1 block" dateTime={date}>
        <div className="h1 bold line-height-1 mr1 inline-block">{dayOfMonth}</div>

        <div className="align-top inline-block">
          <div className="h5 bold">{localization[dayOfWeek]}</div>
          <div className="h6 caps">{localization[month]} {year}</div>
        </div>
      </time>

      {/*Text*/}
      <div className="h5 bold">{renderHTML(text)}</div>

      {/*Edit button*/}
      <EditButton className="absolute top-0 right-0 white" onClick={handleOnEditButtonClick} />
    </div>
  )
}

TimelineItem.propTypes = propTypes

export default TimelineItem
