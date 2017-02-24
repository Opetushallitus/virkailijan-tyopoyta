import React, { PropTypes } from 'react'
import Bacon from 'baconjs'

// Components
import Notification from './Notification'
import NotificationTagSelect from './NotificationTagSelect'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

const propTypes = {
  notificationsController: PropTypes.object.isRequired,
  tagsController: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  notifications: PropTypes.object.isRequired,
  tags: PropTypes.object.isRequired
}

class Notifications extends React.Component {
  constructor (props) {
    super(props)

    this.getNextPage = this.getNextPage.bind(this)
  }

  componentDidMount () {
    // Create a stream from scrolling event
    Bacon
      .fromEvent(window, 'scroll')
      .debounce(100)
      .onValue(() => {
        // Get next page when scrolling to skeletonNotification
        const isSkeletonNotificationVisible = window.scrollY >=
          document.body.scrollHeight - window.innerHeight - this.skeletonNotification.clientHeight

        if (isSkeletonNotificationVisible) {
          this.getNextPage()
        }
      })
  }

  getNextPage () {
    const {
      currentPage,
      hasPagesLeft,
      isLoading
    } = this.props.notifications

    // Check if new page is already being fetched and there are more notifications to get
    if (isLoading || !hasPagesLeft) {
      return
    }

    const nextPage = currentPage + 1

    this.props.notificationsController.getPage(nextPage)
  }

  render () {
    const {
      notificationsController,
      tagsController,
      locale,
      notifications,
      tags
    } = this.props

    const {
      items,
      expanded,
      hasPagesLeft,
      isInitialLoad
    } = notifications

    return (
      <div>
        <h2 className="hide">{translate('tiedotteet')}</h2>

        <div className="mb3">
          <NotificationTagSelect
            locale={locale}
            options={tags.items}
            selectedOptions={tags.selectedItems}
            controller={tagsController}
            isInitialLoad={isInitialLoad}
            isLoading={tags.isLoading}
          />
        </div>

        {/*Skeleton screen*/}
        <div className={isInitialLoad ? '' : 'display-none'}>
          <div className="mb3 p3 rounded bg-white box-shadow" />
          <div className="mb3 p3 rounded bg-white box-shadow" />
        </div>

        <div className={`notifications ${isInitialLoad ? 'display-none' : ''}`}>
          {
            !isInitialLoad && items.length === 0
              ? <div className="h3 center muted">{translate('eitiedotteita')}</div>
              : null
          }

          {items.map(notification =>
            <Notification
              key={`notification${notification.id}`}
              controller={notificationsController}
              locale={locale}
              notification={notification}
              tags={tags.items}
              expandedNotifications={expanded}
            />
          )}

          <div
            ref={skeletonNotification => (this.skeletonNotification = skeletonNotification)}
            className={`mb3 p3 rounded bg-white box-shadow ${hasPagesLeft ? '' : 'display-none'}`}
          />
        </div>

        <div className={`center py3 ${hasPagesLeft ? '' : 'display-none'}`}>
          {/*Visually hidden button for accessibility*/}
          <button
            className="hide"
            type="button"
            onClick={this.getNextPage}
          >
            {translate('naytalisaatiedotteita')}
          </button>

          <Spinner isVisible={hasPagesLeft} />
        </div>
      </div>
    )
  }
}

Notifications.propTypes = propTypes

export default Notifications
