import React, { PropTypes } from 'react'
import R from 'ramda'
import renderHTML from 'react-render-html'

// Components
import Tag from '../common/Tag'
import Icon from '../common/Icon'
import Button from '../common/buttons/Button'
import EditButton from '../common/buttons/EditButton'
import { translate } from '../common/Translations'

const propTypes = {
  locale: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  expandedNotifications: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired
}

function Notification (props) {
  const {
    locale,
    controller,
    notification,
    tags,
    expandedNotifications
  } = props

  const handleNotificationClick = () => {
    controller.toggle(notification.id)
  }

  const handleEditButtonClick = () => {
    controller.edit(notification.releaseId)
  }

  const truncate = length => R.when(
    R.propSatisfies(R.gt(R.__, length), 'length'),
    R.pipe(R.take(length), R.append('…'), R.join(''))
  )

  const getTagName = (id, locale, tags) => {
    return R.prop(`name_${locale}`,
      R.find(R.propEq('id', id))(tags)
    )
  }

  const content = notification.content[locale]
  const flattenedTags = R.flatten(R.pluck('items', tags))

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
              ? translate('naytakatkelma')
              : translate('naytatiedote')
          }
          onClick={handleNotificationClick}
        >
          <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} />

          <span className="hide">
            { isExpanded
              ? translate('naytakatkelma')
              : translate('naytatiedote')
            }
          </span>
        </Button>
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
          {notification.tags.map(tag =>
            <Tag
              key={`notificationTag${tag.id}`}
              text={getTagName(tag, locale, flattenedTags)}
            />
          )}
        </span>
      </div>
    </div>
  )
}

Notification.propTypes = propTypes

export default Notification
