import React, { PropTypes } from 'react'
import renderHTML from 'react-render-html'

// Components
import Button from '../common/buttons/Button'
import EditButton from '../common/buttons/EditButton'
import RemoveButton from '../common/buttons/RemoveButton'
import CloseButton from '../common/buttons/CloseButton'
import Tag from '../common/Tag'
import Icon from '../common/Icon'
import Popup from '../common/Popup'
import Overlay from '../common/Overlay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

import animate from '../utils/animate'

const propTypes = {
  index: PropTypes.number.isRequired,
  controller: PropTypes.object.isRequired,
  defaultLocale: PropTypes.string.isRequired,
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
    this.handleRemoveButtonClick = this.handleRemoveButtonClick.bind(this)
    this.handleConfirmRemoveButtonClick = this.handleConfirmRemoveButtonClick.bind(this)
    this.handleOutsidePopupClick = this.handleOutsidePopupClick.bind(this)
    this.handleCloseRelatedNotificationButtonClick = this.handleCloseRelatedNotificationButtonClick.bind(this)

    this.state = {
      isVisible: true
    }
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

  componentWillReceiveProps (newProps) {
    if (newProps.notification.isRemoved) {
      setTimeout(() => {
        this.setState({
          isVisible: false
        })
      }, 500)
    }
  }

  handleNotificationClick () {
    this.notification.classList.toggle('notification-is-expanded')
  }

  handleEditButtonClick () {
    this.props.controller.edit(this.props.notification.releaseId)
  }

  handleRemoveButtonClick () {
    this.props.controller.remove(this.props.notification, this.props.index, true)
  }

  handleOutsidePopupClick () {
    this.props.controller.remove(this.props.notification, this.props.index, false)
  }

  handleConfirmRemoveButtonClick () {
    this.props.controller.confirmRemove(this.props.notification, this.props.index)
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

    const {
      confirmRemove,
      isRemoving,
      isRemoved
    } = notification

    const isRelatedToTimelineItem = notification.isRelatedToTimelineItem
    const isDisruptionNotification = tags.indexOf(translate('hairiotiedote')) > -1

    // Use default locale's content if the version for user's language is missing
    const content = notification.content[user.lang] || notification.content[defaultLocale]

    // Strip HTML tags from text
    const parsedText = content.text.replace(/(<([^>]+)>)/ig, '')

    const excerptLength = 100
    const isExpandable = parsedText.length > excerptLength

    const classList = [
      'notification',
      'relative',
      'mb3',
      'pt2',
      'px2',
      'pb1',
      'border',
      'border-gray-lighten-3',
      'rounded',
      'bg-white',
      'box-shadow',
      `${isExpandable ? 'notification-is-expandable' : ''}`,
      `${isDisruptionNotification ? 'notification-disruption' : ''}`
    ]

    return this.state.isVisible && (
      <div
        ref={notification => (this.notification = notification)}
        id={`notification${notification.id}`}
        className={
          `notification-container relative
          ${isRemoving ? 'notification-is-overlaid' : ''}
          ${isRemoved ? 'notification-is-removed' : ''}`
        }
      >
        {
          isRemoving
            ? <Overlay variants={['component', 'transparent']}>
              <Spinner isVisible />
            </Overlay>
            : null
        }

        {/*Title for screen readers*/}
        <h3 className="hide">
          {content.title}
        </h3>

        {/*Expand/contract button*/}
        {
          isExpandable && !isRelatedToTimelineItem
            ? <div className={`notification absolute top-0 right-0 z2`}>
              <Button
                className="notification-expand-button button-icon gray"
                title={translate('naytatiedote')}
                onClick={this.handleNotificationClick}
              >
                <Icon name="chevron-down" />
                <span className="hide">{translate('naytatiedote')}</span>
              </Button>

              <Button
                className="notification-contract-button button-icon gray"
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

        {/*Edit & remove buttons*/}
        {
          user.isAdmin
            ? <div
              id={`notification${notification.id}-actions`}
              className="absolute bottom-0 right-0 z2"
            >
              <EditButton onClick={this.handleEditButtonClick} />
              <RemoveButton onClick={this.handleRemoveButtonClick} />
            </div>
            : null
        }

        {/*Confirm removing*/}
        {
          confirmRemove && !isRemoved
            ? <Popup
              target={`#notification${notification.id}-actions`}
              type="default"
              position="right"
              title={translate('vahvistatiedotteenpoistaminen')}
              onOutsideClick={this.handleOutsidePopupClick}
            >
              <Button className="oph-button-confirm" onClick={this.handleConfirmRemoveButtonClick}>
                {translate('poista')}
              </Button>

              <Button className="oph-button-cancel" onClick={this.handleOutsidePopupClick}>
                {translate('peruuta')}
              </Button>
            </Popup>
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
