import React, { PropTypes } from 'react'
import renderHTML from 'react-render-html'

// Components
import Button from '../common/buttons/Button'
import EditButton from '../common/buttons/EditButton'
import CloseButton from '../common/buttons/CloseButton'
import Tag from '../common/Tag'
import Icon from '../common/Icon'
import { translate } from '../common/Translations'

import animate from '../utils/animate'

const propTypes = {
  defaultLocale: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired
}

class Notification extends React.Component {
  constructor (props) {
    super(props)

    this.handleNotificationClick = this.handleNotificationClick.bind(this)
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this)
    this.handleCloseRelatedNotificationButtonClick = this.handleCloseRelatedNotificationButtonClick.bind(this)
  }

  componentDidMount () {
    // Animate notification related to timeline item
    if (this.props.notification.isRelatedToTimelineItem) {
      animate({
        node: this.notification,
        animation: 'pulse',
        duration: 750
      })
    }
  }

  handleNotificationClick () {
    this.notification.classList.toggle('notification-is-expanded')
  }

  handleEditButtonClick () {
    this.props.controller.edit(this.props.notification.releaseId)
  }

  handleCloseRelatedNotificationButtonClick () {
    this.props.controller.getPage(1)
  }

  render () {
    const {
      defaultLocale,
      user,
      notification,
      categories,
      tags
    } = this.props

    const isRelatedToTimelineItem = notification.isRelatedToTimelineItem
    const isDisruptionNotification = tags.indexOf(translate('hairiotiedote')) > -1

    // Use default locale's content if the version for user's language is missing
    const content = notification.content[user.lang] || notification.content[defaultLocale]

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
      `${isExpandable ? 'notification-is-expandable' : ''}`,
      `${isDisruptionNotification ? 'notification-disruption' : ''}`
    ]

    return (
      <div
        ref={notification => (this.notification = notification)}
        id={`notification${notification.id}`}
        className="notification relative"
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
                onClick={this.handleNotificationClick}
              >
                <Icon name="chevron-down" />
                <span className="hide">{translate('naytatiedote')}</span>
              </Button>

              <Button
                className="notification-contract-button button-link gray-lighten-1"
                title={translate('naytakatkelma')}
                onClick={this.handleNotificationClick}
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
              onClick={this.handleCloseRelatedNotificationButtonClick}
            />
            : null
        }

        {/*Edit button*/}
        {
          user.isAdmin
            ? <EditButton
              className="absolute bottom-0 right-0 z2 gray-lighten-1"
              onClick={this.handleEditButtonClick}
            />
            : null
        }

        <div className={classList.join(' ')} onClick={isExpandable ? this.handleNotificationClick : null}>
          {/*Visible title*/}
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
            {user.isAdmin ? notification.createdBy : null}
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
}

Notification.propTypes = propTypes

export default Notification
