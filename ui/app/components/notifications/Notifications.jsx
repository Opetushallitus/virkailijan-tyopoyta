import React, { PropTypes } from 'react'
import Bacon from 'baconjs'

// Components
import Notification from './Notification'
import NotificationTagSelect from './NotificationTagSelect'
import QuickTagSelect from './QuickTagSelect'
import Spinner from '../common/Spinner'
import Translation from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  nextPage: PropTypes.number.isRequired,
  notifications: PropTypes.array.isRequired,
  expandedNotifications: PropTypes.array.isRequired,
  notificationTags: PropTypes.array.isRequired,
  selectedNotificationTags: PropTypes.array.isRequired
}

// Get quick selection tags
const getQuickTags = tags => {
  return tags.filter(tag => {
    return tag.isQuickTag
  })
}

class Notifications extends React.Component {
  componentDidMount () {
    // Create a stream from scrolling event
    Bacon
      .fromEvent(this.notifications, 'scroll')
      .debounce(100)
      .onValue((event) => {
        const node = event.target

        // Check if user has scrolled to the bottom of the notification list - 10%
        const isLoadingHeightBreakpoint = (node.offsetHeight + node.scrollTop) >=
          node.scrollHeight - (node.scrollHeight / 10)

        if (isLoadingHeightBreakpoint) {
          this.props.controller.lazyLoadNotifications({
            node: event.target,
            page: this.props.nextPage,
            isLoading: true
          })
        }
      })
  }

  render () {
    const {
      controller,
      locale,
      notifications,
      expandedNotifications,
      notificationTags,
      selectedNotificationTags
    } = this.props

    const quickTags = getQuickTags(notificationTags)

    return (
      <div
        className="notifications autohide-scrollbar"
        ref={notifications => { this.notifications = notifications }}
      >
        <h2 className="hide"><Translation trans="tiedotteet" /></h2>

        <NotificationTagSelect
          locale={locale}
          options={notificationTags}
          selectedOptions={selectedNotificationTags}
          controller={controller}
        />

        <div
          className="notification-tag-select-container pt2 px2 pb1
          border border-gray-lighten-2 rounded-bottom-left rounded-bottom-right"
        >
          <QuickTagSelect
            locale={locale}
            options={quickTags}
            selectedOptions={selectedNotificationTags}
            controller={controller}
          />
        </div>

        {notifications.map(notification =>
          <Notification
            key={notification.id}
            controller={controller}
            locale={locale}
            notification={notification}
            tags={notificationTags}
            expandedNotifications={expandedNotifications}
          />
        )}

        <Spinner isVisible={false} />
      </div>
    )
  }
}

Notifications.propTypes = propTypes

export default Notifications
