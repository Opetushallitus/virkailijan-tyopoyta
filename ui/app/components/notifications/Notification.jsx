import React, { PropTypes } from 'react'
import renderHTML from 'react-render-html'

// Components
import Button from '../common/buttons/Button'
import CloseButton from '../common/buttons/CloseButton'
import IconButton from '../common/buttons/IconButton'
import Tag from '../common/Tag'
import Popup from '../common/Popup'
import Overlay from '../common/Overlay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

import animate from '../utils/animate'

const variants = ['disruption']

const propTypes = {
  index: PropTypes.number.isRequired,
  variant: PropTypes.oneOf(variants),
  controller: PropTypes.object.isRequired,
  defaultLocale: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired
}

const defaultProps = {
  variant: null
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
    // Check if notification is removed and should be set hidden
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

  // Reset the list when closing a notification related to a timeline item
  handleCloseRelatedNotificationButtonClick () {
    this.props.controller.getPage(1)
  }

  render () {
    const {
      variant,
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

    // Has user clicked "Display related notification" on a timeline item whose notification isn't wasn't on the list?
    const isRelatedToTimelineItem = notification.isRelatedToTimelineItem

    // Use default locale's content if the version for user's language is missing
    const content = notification.content[user.lang] || notification.content[defaultLocale]

    // Strip HTML tags from text
    const parsedText = content.text.replace(/(<([^>]+)>)/ig, '').trim().replace(/<p><\/p>/g, '')

    const excerptLength = 100
    const isExpandable = parsedText.length > excerptLength

    return this.state.isVisible && (
      <div
        ref={notification => (this.notification = notification)}
        id={`notification${notification.id}`}
        className={`
          notification-container
          ${isRemoving ? 'notification-is-overlaid' : ''}
          ${isRemoved ? 'notification-is-removed' : ''}
        `}
      >
        {/*Display an overlay and a spinner when notification is being removed*/}
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
            ? <div className="absolute top-0 right-0 z2">
              <div className="notification-expand-button">
                <IconButton
                  icon="chevron-down"
                  title={translate('naytatiedote')}
                  onClick={this.handleNotificationClick}
                />
              </div>

              <div className="notification-contract-button">
                <IconButton
                  icon="chevron-up"
                  title={translate('naytakatkelma')}
                  onClick={this.handleNotificationClick}
                />
              </div>
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
              <IconButton
                id={`notification${notification.id}-edit-button`}
                icon="pencil"
                title={translate('muokkaa')}
                onClick={this.handleEditButtonClick}
              />
              <IconButton
                id={`notification${notification.id}-remove-button`}
                icon="trash"
                title={translate('poista')}
                onClick={this.handleRemoveButtonClick}
              />
            </div>
            : null
        }

        {/*Confirm removing*/}
        {
          confirmRemove && !isRemoved
            ? <Popup
              target={`#notification${notification.id}-actions`}
              variant="default"
              position="right"
              title={translate('vahvistatiedotteenpoistaminen')}
              onOutsideClick={this.handleOutsidePopupClick}
            >
              <Button variants={['confirm']} onClick={this.handleConfirmRemoveButtonClick}>
                {translate('poista')}
              </Button>

              <Button variants={['cancel']} onClick={this.handleOutsidePopupClick}>
                {translate('peruuta')}
              </Button>
            </Popup>
            : null
        }

        {/*Content*/}
        <div
          className={`
            notification
            ${variant ? `notification-${variant}` : ''}
            ${isExpandable ? 'notification-is-expandable' : ''}
          `}
          onClick={isExpandable ? this.handleNotificationClick : null}
        >
          {/*Visible title*/}
          <h3 className="notification-heading" aria-hidden>
            {content.title}
          </h3>

          {/*Content*/}
          <div className="col-12">
            <div className={`mb2 ${isExpandable ? 'notification-content-expandable' : 'notification-content'}`}>
              {renderHTML(content.text.trim().replace(/<p><\/p>/g, ''))}
            </div>
          </div>

          {/*Create date and creator's initials*/}
          <span className={`oph-h5 oph-muted mb1 ${notification.tags.length === 0 ? 'inline-block' : ''}`}>
            <time className="mr1">{notification.createdAt}</time>
            {user.isAdmin ? notification.createdBy : null}
          </span>

          {/*Categories & tags*/}
          <span className="mx2">
            {categories.map(category =>
              <Tag
                key={`notificationTag${category.id}`}
                variant="category"
                text={translate(category.name)}
              />
            )}

            {tags.map(tag =>
              <Tag
                key={`notificationTag${tag.id}`}
                text={translate(tag.name)}
              />
            )}
          </span>
        </div>
      </div>
    )
  }
}

Notification.propTypes = propTypes
Notification.defaultProps = defaultProps

export default Notification
