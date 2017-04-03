import React, { PropTypes } from 'react'
import moment from 'moment'
import renderHTML from 'react-render-html'

import Button from '../common/buttons/Button'
import IconButton from '../common/buttons/IconButton'
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

  const removeButtonSelector = `#timeline-release${releaseId}-item${id}-remove-button`
  const removeContainerSelector = `#timeline-release${releaseId}-item${id}-remove-container`
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
    onEditButtonClick(releaseId)
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
    <div className="timeline-item-container">
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
        className={`timeline-item ${index > 0 ? 'mt1' : ''}`}
      >

        {/*Date*/}
        {
          index === 0
            ? <time className="mb1 block" dateTime={date}>
              <div className="oph-h1 oph-bold line-height-1 inline-block mr1">{dayOfMonth}</div>

              <div className="align-top inline-block pr2">
                <div className="oph-h5 oph-bold lowercase">{translate(dayOfWeek)}</div>
                <div className="oph-h6 caps">{translate(month)} {year}</div>
              </div>
            </time>
            : null
        }

        {/*Text*/}
        <div className="oph-h5 bold pr2">{renderHTML(content.text)}</div>

        {/*Display related notification*/}
        {
          notificationId
            ? <a
              className="oph-h5 oph-link oph-bold"
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
            ? <div className="absolute top-0 right-0 oph-white">
              <IconButton
                id={`timeline-release${releaseId}-item${id}-edit-button`}
                icon="pencil"
                title={translate('muokkaa')}
                onClick={handleEditButtonClick}
              />
            </div>
            : null
        }

        {/*Remove button*/}
        {
          user.isAdmin
            ? <div className="absolute bottom-0 right-0">
              <IconButton
                id={`timeline-release${releaseId}-item${id}-remove-button`}
                icon="trash"
                title={translate('poista')}
                onClick={handleRemoveButtonClick}
              />
            </div>
            : null
        }

        {/*Confirm removing*/}
        {
          user.isAdmin
            ? <div
              id={`timeline-release${releaseId}-item${id}-remove-container`}
              className="oph-h5 bold center mt1 pt1 border-top border-blue-lighten-1 display-none"
            >
              {translate('vahvistatapahtumanpoistaminen')}

              <div className="mt1">
                <Button variants={['confirm']} onClick={handleConfirmRemoveButtonClick}>
                  {translate('poista')}
                </Button>

                <Button variants={['ghost']} onClick={handleCancelRemoveButtonClick}>
                  {translate('peruuta')}
                </Button>
              </div>
            </div>
            : null
        }
      </div>
    </div>
  )
}

TimelineItem.propTypes = propTypes

export default TimelineItem

