import React, { PropTypes } from 'react'
import R from 'ramda'
import renderHTML from 'react-render-html'

// Components
import Tag from '../common/Tag'
import Icon from '../common/Icon'
import Button from '../common/buttons/Button'
import EditButton from '../common/buttons/EditButton'
import CloseButton from '../common/buttons/CloseButton'
import { translate } from '../common/Translations'

const propTypes = {
  locale: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired
}

function Notification (props) {
  const {
    locale,
    controller,
    notification,
    tags
  } = props

  const handleNotificationClick = () => {
    if (!isExpandable) {
      return
    }

    const node = document.querySelector(`#notification${notification.id}`)

    node.classList.toggle('notification-is-expanded')
  }

  const handleEditButtonClick = () => {
    controller.edit(notification.releaseId)
  }

  const handleCloseRelatedNotificationButtonClick = () => {
    controller.getPage(1)
  }

  const getTagName = (id, locale, tags) => {
    return R.prop(`name_${locale}`,
      R.find(R.propEq('id', id))(tags)
    )
  }

  const isRelatedToTimelineItem = notification.isRelatedToTimelineItem
  const content = notification.content[locale]
  const allTags = R.flatten(R.pluck('items', tags))

  // Sort tag IDs to list them in the same order in all rendered notifications
  const sortedNotificationTags = notification.tags.sort()

  // Strip HTML tags from text
  // TODO: do not use regex
  const parsedText = content.text.replace(/(<([^>]+)>)/ig, '')

  const excerptLength = 100
  const isExpandable = parsedText.length > excerptLength

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
    `${isExpandable ? 'notification-is-expandable' : ''}`
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
      <EditButton
        className="absolute bottom-0 right-0 z2 gray-lighten-1"
        onClick={handleEditButtonClick}
      />

      <div className={classList.join(' ')} onClick={handleNotificationClick}>
        {/*Title*/}
        <h3 className="notification-heading h4 primary bold inline-block mb2 mr2" aria-hidden>
          {content.title}
        </h3>

        {/*Content*/}
        <div className="col-12">
          <div className="notification-content mb2">{renderHTML(content.text)}</div>
        </div>

        {/*Create date and creator's initials*/}
        <span className={`h6 mb1 muted ${!notification.tags.length ? 'inline-block' : ''}`}>
          <time className="mr1">{notification.created}</time>
          {notification.creator}
        </span>

        {/*Tags*/}
        <span className="mx2">
          {sortedNotificationTags.map(tag =>
            <Tag
              key={`notificationTag${tag}`}
              text={getTagName(tag, locale, allTags)}
            />
          )}
        </span>
      </div>
    </div>
  )
}

Notification.propTypes = propTypes

export default Notification
