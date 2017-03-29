import React, { PropTypes } from 'react'
import moment from 'moment'
import renderHTML from 'react-render-html'

import Button from '../common/buttons/Button'
import EditButton from '../common/buttons/EditButton'
import RemoveButton from '../common/buttons/RemoveButton'
import Overlay from '../common/Overlay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'
import animate from '../utils/animate'

const propTypes = {
  index: PropTypes.number.isRequired,
  htmlId: PropTypes.string.isRequired,
  dayId: PropTypes.string.isRequired,
  defaultLocale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  onDisplayRelatedNotificationLinkClick: PropTypes.func.isRequired,
  onEditButtonClick: PropTypes.func.isRequired,
  onConfirmRemoveButtonClick: PropTypes.func.isRequired
}

function TimelineItem (props) {
  const {
    index,
    htmlId,
    dayId,
    defaultLocale,
    dateFormat,
    user,
    item,
    onDisplayRelatedNotificationLinkClick,
    onEditButtonClick,
    onConfirmRemoveButtonClick
  } = props

  const {
    id,
    releaseId,
    notificationId,
    date
  } = item

  const momentDate = moment(date, dateFormat)
  const dayOfMonth = momentDate.format('D')
  const dayOfWeek = momentDate.format('dddd')
  const month = momentDate.format('MMMM')
  const year = momentDate.format('YYYY')

  // Use default locale's content if the version for user's language is missing
  const content = item.content[user.lang] || item.content[defaultLocale]

  const removeButtonSelector = `.timeline-release${releaseId}-item${id}-remove-button`
  const removeContainerSelector = `.timeline-release${releaseId}-item${id}-remove-container`
  const overlaySelector = `#${htmlId}-overlay`

  const handleDisplayNotificationLinkClick = event => {
    event.preventDefault()

    const notificationId = item.notificationId
    const relatedNotification = document.querySelector(`#notification${notificationId}`)

    // If the notification exists on the page, scroll to, animate and toggle it
    if (relatedNotification) {
      relatedNotification.classList.add('notification-is-expanded')
      window.location.href = `#notification${notificationId}`

      animate({
        node: relatedNotification,
        animation: 'pulse',
        duration: 750
      })
    } else {
      // Else get related notification
      onDisplayRelatedNotificationLinkClick(item.releaseId)
    }
  }

  const handleEditButtonClick = () => {
    onEditButtonClick(id)
  }

  const handleRemoveButtonClick = () => {
    document.querySelector(removeButtonSelector).classList.add('display-none')
    document.querySelector(removeContainerSelector).classList.remove('display-none')
  }

  const handleConfirmRemoveButtonClick = () => {
    document.querySelector(`#${htmlId}`).style.opacity = 0.3
    document.querySelector(overlaySelector).classList.remove('display-none')

    onConfirmRemoveButtonClick(id, `#${htmlId}`, `#${dayId}`)
  }

  const handleCancelRemoveButtonClick = () => {
    document.querySelector(removeButtonSelector).classList.remove('display-none')
    document.querySelector(removeContainerSelector).classList.add('display-none')
    document.querySelector(overlaySelector).classList.add('display-none')
  }

  return (
    <div className="timeline-item-container relative">
      {
        user.isAdmin
          ? <div id={`${htmlId}-overlay`} className="display-none">
            <Overlay variants={['component', 'transparent']}>
              <Spinner isVisible />
            </Overlay>
          </div>
          : null
      }

      <div
        id={htmlId}
        className={`timeline-item break-word left-align p2
        relative rounded white bg-blue ${index > 0 ? 'mt1' : ''}`}
      >

        {/*Date*/}
        {
          index === 0
            ? <time className="mb1 block" dateTime={date}>
              <div className="h1 bold line-height-1 mr1 inline-block">{dayOfMonth}</div>

              <div className="align-top inline-block pr2">
                <div className="h5 lowercase bold">{translate(dayOfWeek)}</div>
                <div className="h6 caps">{translate(month)} {year}</div>
              </div>
            </time>
            : null
        }

        {/*Text*/}
        <div className="h5 bold pr2">{renderHTML(content.text)}</div>

        {/*Display related notification*/}
        {
          notificationId
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
        {
          user.isAdmin
            ? <EditButton
              id={`timeline-release${releaseId}-item${id}-edit-button`}
              className="absolute top-0 right-0 white"
              onClick={handleEditButtonClick}
            />
            : null
        }

        {/*Remove button*/}
        {
          user.isAdmin
            ? <RemoveButton
              className={`absolute bottom-0 right-0 white ${`timeline-release${releaseId}-item${id}-remove-button`}`}
              onClick={handleRemoveButtonClick}
            />
            : null
        }

        {/*Confirm removing*/}
        {
          user.isAdmin
            ? <div
              className={`h5 bold center mt1 pt1 border-top border-blue-lighten-1 display-none
              ${`timeline-release${releaseId}-item${id}-remove-container`}`}
            >
              {translate('vahvistatapahtumanpoistaminen')}:
              <br />

              <Button className="oph-button-ghost white" onClick={handleConfirmRemoveButtonClick}>
                {translate('poista')}
              </Button>

              <Button className="oph-button-ghost white" onClick={handleCancelRemoveButtonClick}>
                {translate('peruuta')}
              </Button>
            </div>
            : null
        }
      </div>
    </div>
  )
}

TimelineItem.propTypes = propTypes

export default TimelineItem

