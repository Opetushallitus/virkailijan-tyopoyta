import React, { PropTypes } from 'react'
import renderHTML from 'react-render-html'

// Components
import Button from '../common/buttons/Button'
import EditButton from '../common/buttons/EditButton'
import CloseButton from '../common/buttons/CloseButton'
import Conditional from '../common/Conditional'
import Tag from '../common/Tag'
import Icon from '../common/Icon'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired
}

function Notification (props) {
  const {
    controller,
    user,
    notification,
    categories,
    tags
  } = props

  const isRelatedToTimelineItem = notification.isRelatedToTimelineItem
  const isDisruptionNotification = tags.indexOf(translate('hairiotiedote')) > -1

  const content = notification.content[user.lang]

  // Strip HTML tags from text
  // TODO: do not use regex
  const parsedText = content.text.replace(/(<([^>]+)>)/ig, '')

  const excerptLength = 100
  const isExpandable = parsedText.length > excerptLength

  const handleNotificationClick = () => {
    const node = document.querySelector(`#notification${notification.id}`)

    node.classList.toggle('notification-is-expanded')
  }

  const handleEditButtonClick = () => {
    controller.edit(notification.releaseId)
  }

  const handleCloseRelatedNotificationButtonClick = () => {
    controller.getPage(1)
  }

  const classList = [
    'relative',
    'mb3',
    'pt2',
    'px2',
    'pb1',
    'z1',
    'border',
    'border-gray-lighten-3',
    'rounded',
    'bg-white',
    'box-shadow',
    `${isExpandable ? 'notification-is-expandable' : ''}`,
    `${isDisruptionNotification ? 'notification-disruption' : ''}`
  ]

  return (
    <div
      id={`notification${notification.id}`}
      className={`notification relative
      ${isRelatedToTimelineItem ? 'notification-is-expanded animated animation-pulse' : ''}`}
    >
      {/*Title for screen readers*/}
      <h3 className="hide">
        {content.title}
      </h3>

      {/*Expand/contract button*/}
      {
        isExpandable && !isRelatedToTimelineItem
          ? <div className="absolute top-0 right-0 z2">
            <Button
              className="notification-expand-button button-link gray-lighten-1"
              title={translate('naytatiedote')}
              onClick={handleNotificationClick}
            >
              <Icon name="chevron-down" />
              <span className="hide">{translate('naytatiedote')}</span>
            </Button>

            <Button
              className="notification-contract-button button-link gray-lighten-1"
              title={translate('naytakatkelma')}
              onClick={handleNotificationClick}
            >
              <Icon name="chevron-up" />
              <span className="hide">{translate('naytakatkelma')}</span>
            </Button>
          </div>
          : null
      }

      {/*Close related notification, resets the notification list*/}
      {
        isRelatedToTimelineItem
          ? <CloseButton
            className="z2"
            title="naytakaikkitiedotteet"
            onClick={handleCloseRelatedNotificationButtonClick}
          />
          : null
      }

      {/*Edit button*/}
      <Conditional isRendered={user.isAdmin}>
        <EditButton
          className="absolute bottom-0 right-0 z2 gray-lighten-1"
          onClick={handleEditButtonClick}
        />
      </Conditional>

      <div className={classList.join(' ')} onClick={isExpandable ? handleNotificationClick : null}>
        {/*Title*/}
        <h3 className="notification-heading h4 primary bold inline-block mb2 mr2" aria-hidden>
          {content.title}
        </h3>

        {/*Content*/}
        <div className="col-12">
          <div className="notification-content mb2">{renderHTML(content.text)}</div>
        </div>

        {/*Create date and creator's initials*/}
        <span className={`h5 mb1 muted ${!notification.tags.length ? 'inline-block' : ''}`}>
          <time className="mr1">{notification.createdAt}</time>
          {notification.createdBy}
        </span>

        {/*Categories & tags*/}
        <span className="mx2">
          {categories.map(category =>
            <Tag
              key={`notificationTag${category.id}`}
              className="bg-blue-lighten-2"
              text={category.name}
            />
          )}

          {tags.map(tag =>
            <Tag
              key={`notificationTag${tag.id}`}
              text={tag.name}
            />
          )}
        </span>
      </div>
    </div>
  )
}

Notification.propTypes = propTypes

export default Notification
