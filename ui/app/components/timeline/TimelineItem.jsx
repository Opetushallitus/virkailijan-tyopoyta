import React, { PropTypes } from 'react'
import moment from 'moment'
import renderHTML from 'react-render-html'

import EditButton from '../common/buttons/EditButton'
import { translate } from '../common/Translations'

const propTypes = {
  index: PropTypes.number.isRequired,
  dateFormat: PropTypes.string.isRequired,
  releaseId: PropTypes.number.isRequired,
  date: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  onEditButtonClick: PropTypes.func.isRequired
}

function TimelineItem (props) {
  const {
    index,
    dateFormat,
    releaseId,
    date,
    text,
    onEditButtonClick
  } = props

  const handleEditButtonClick = () => {
    onEditButtonClick(releaseId, 'edit-timeline')
  }

  const momentDate = moment(date, dateFormat)
  const dayOfMonth = momentDate.format('D')
  const dayOfWeek = momentDate.format('dddd')
  const month = momentDate.format('MMMM')
  const year = momentDate.format('YYYY')

  return (
    <div className={`timeline-item break-word left-align p2 relative rounded white bg-blue ${index > 0 ? 'mt1' : ''}`}>
      {/*Date*/}
      { index === 0
        ? <time className="mb1 block" dateTime={date}>
          <div className="h1 bold line-height-1 mr1 inline-block">{dayOfMonth}</div>

          <div className="align-top inline-block">
            <div className="h5 lowercase bold">{translate(dayOfWeek)}</div>
            <div className="h6 caps">{translate(month)} {year}</div>
          </div>
        </time>
        : null
      }

      {/*Text*/}
      <div className="h5 bold">{renderHTML(text)}</div>

      {/*Edit button*/}
      <EditButton className="absolute top-0 right-0 white" onClick={handleEditButtonClick} />
    </div>
  )
}

TimelineItem.propTypes = propTypes

export default TimelineItem

