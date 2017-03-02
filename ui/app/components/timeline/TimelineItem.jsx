import React, { PropTypes } from 'react'
import moment from 'moment'
import renderHTML from 'react-render-html'

import EditButton from '../common/buttons/EditButton'
import { translate } from '../common/Translations'

const propTypes = {
  index: PropTypes.number.isRequired,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
  onEditButtonClick: PropTypes.func.isRequired
}

function TimelineItem (props) {
  const {
    index,
    locale,
    dateFormat,
    item,
    onEditButtonClick
  } = props

  const {
    releaseId,
    notificationId,
    date,
    content
  } = item

  const handleDisplayNotificationLinkClick = event => {
    event.preventDefault()

    const notificationId = item.notificationId
    const relatedNotification = document.querySelector(`#notification${notificationId}`)
    const animationTime = 1000

    // If the notification exists on the page and previous animation isn't done, move to and animate it
    if (relatedNotification && !relatedNotification.classList.contains('animated')) {
      window.location.href = `#notification${notificationId}`

      relatedNotification.classList.add('animated', 'animation-pulse')

      // Remove classes after animation is finished
      setTimeout(() => {
        relatedNotification.classList.remove('animated', 'animation-pulse')
      }, animationTime)
    } else {
      // Else get related notification
    }
  }

  const handleEditButtonClick = () => {
    onEditButtonClick(releaseId, 'edit-timeline')
  }

  const momentDate = moment(date, dateFormat)
  const dayOfMonth = momentDate.format('D')
  const dayOfWeek = momentDate.format('dddd')
  const month = momentDate.format('MMMM')
  const year = momentDate.format('YYYY')

  return (
    <div
      className={`timeline-item break-word left-align p2
      relative rounded white bg-blue ${index > 0 ? 'mt1' : ''}`}
    >
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
      <div className="h5 bold">{renderHTML(content[locale].text)}</div>

      {/*Display related notification*/}
      { notificationId
        ? <a
          className="h5 bold"
          href="#"
          onClick={handleDisplayNotificationLinkClick}
        >
          {translate('naytatapahtumantiedote')}
        </a>
        : null
      }

      {/*Edit button*/}
      <EditButton className="absolute top-0 right-0 white" onClick={handleEditButtonClick} />
    </div>
  )
}

TimelineItem.propTypes = propTypes

export default TimelineItem

