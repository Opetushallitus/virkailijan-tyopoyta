import React, { PropTypes } from 'react'
import R from 'ramda'
import renderHTML from 'react-render-html'

// Components
import Tag from '../common/Tag'
import Icon from '../common/Icon'
import Button from '../common/buttons/Button'
import EditButton from '../common/buttons/EditButton'
import Translation from '../common/Translations'

const propTypes = {
  locale: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  expandedNotifications: PropTypes.array.isRequired
}

function Notification (props) {
  const {
    locale,
    controller,
    notification,
    tags,
    expandedNotifications
  } = props

  const handleOnNotificationClick = () => {
    controller.toggleNotification(notification.id)
  }

  const handleOnEditButtonClick = () => {
    controller.toggleEditor(notification.releaseId)
  }

  const truncate = length => R.when(
    R.propSatisfies(R.gt(R.__, length), 'length'),
    R.pipe(R.take(length), R.append('…'), R.join(''))
  )

  const content = notification.content[locale]

  // Strip HTML tags from text
  // TODO: do not use regex
  const parsedText = content.text.replace(/(<([^>]+)>)/ig, '')

  const excerptLength = 100
  const excerpt = truncate(excerptLength)(parsedText)

  const isExpandable = parsedText.length > excerptLength
  const isExpanded = expandedNotifications.indexOf(notification.id) > -1

  const classList = [
    `notification-${notification.type}`,
    `${isExpandable ? 'notification-is-expandable' : ''}`,
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
    'box-shadow'
  ]

  return (
    <div className="notification relative">
      {/*Title for screen readers*/}
      <h3 className="hide">
        {content.title}
      </h3>

      {/*'Show more/less' button*/}
      {/*Display button if text is longer than excerpt length*/}
      {isExpandable
        ? <Button
          className="button-link absolute top-0 right-0 z2 gray-lighten-1"
          title={
            isExpanded
              ? <Translation trans="naytakatkelma" />
              : <Translation trans="naytatiedote" />
          }
          onClick={handleOnNotificationClick}
        >
          <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} />

          <span className="hide">
            { isExpanded
              ? <Translation trans="naytakatkelma" />
              : <Translation trans="naytatiedote" />
            }
          </span>
        </Button>
        : null
      }

      {/*Edit button*/}
      <EditButton
        className="absolute bottom-0 right-0 z2 gray-lighten-1"
        onClick={handleOnEditButtonClick}
      />

      <div className={classList.join(' ')} onClick={handleOnNotificationClick}>
        {/*Title*/}
        <h3 className="notification-heading h4 primary bold inline-block mb2 mr2" aria-hidden>
          {content.title}
        </h3>

        {/*Content*/}
        <div className="mb2">
          {
            isExpanded || !isExpandable
              ? renderHTML(content.text)
              : excerpt
          }
        </div>

        {/*Create date and creator's initials*/}
        <span className={`h6 mb1 muted ${!notification.tags.length ? 'inline-block' : ''}`}>
          <time className="mr1">{notification.created}</time>
          {notification.creator}
        </span>

        {/*Tags*/}
        <span className="mx2">
          {tags.filter(tag => { return notification.tags.indexOf(tag.id) >= 0 }).map(tag =>
            <Tag
              key={`notification.id.${tag.id}`}
              text={tag['name_' + locale]}
            />
          )}
        </span>
      </div>
    </div>
  )
}

Notification.propTypes = propTypes

export default Notification
