import React, { PropTypes } from 'react'
import Bacon from 'baconjs'

// Components
import Notification from './Notification'
import NotificationTagSelect from './NotificationTagSelect'
import QuickTagSelect from './QuickTagSelect'
import Spinner from '../common/Spinner'
import Delay from '../common/Delay'
import { translate } from '../common/Translations'

const propTypes = {
  notificationsController: PropTypes.object.isRequired,
  tagsController: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  notifications: PropTypes.object.isRequired,
  tags: PropTypes.object.isRequired
}

// Get quick selection tags
const getQuickTags = tags => {
  return tags.slice(0, 3)
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
          this.props.notificationsController.getPage()
        }
      })
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
      isLoading,
      isInitialLoad,
      items,
      expanded
    } = notifications

    const quickTags = getQuickTags(tags.items)

    return (
      <div>
        <h2 className="hide">{translate('tiedotteet')}</h2>

        <NotificationTagSelect
          locale={locale}
          options={tags.items}
          selectedOptions={tags.selectedItems}
          controller={tagsController}
          isInitialLoad={isInitialLoad}
          isLoading={tags.isLoading}
        />

        <div
          className={`notification-tag-select-container mb3 border border-gray-lighten-2 rounded-bottom-left rounded-bottom-right
          ${isInitialLoad || tags.isLoading || tags.items.length === 0 ? 'p3' : 'pt2 px2 pb1'}`}
        >
          {
            isInitialLoad || tags.isLoading || tags.items.length === 0
              ? null
              : <QuickTagSelect
                locale={locale}
                options={quickTags}
                selectedOptions={tags.selectedItems}
                controller={tagsController}
              />
          }
        </div>

        {/*Skeleton screen*/}
        <div className={isInitialLoad ? '' : 'display-none'}>
          <div className="mb3 p3 rounded bg-white box-shadow" />
          <div className="mb3 p3 rounded bg-white box-shadow" />
        </div>

        <div
          className={`notifications ${isInitialLoad ? 'display-none' : ''}`}
          ref={notifications => { this.notifications = notifications }}
        >
          {items.map(notification =>
            <Notification
              key={notification.id}
              controller={notificationsController}
              locale={locale}
              notification={notification}
              tags={tags.items}
              expandedNotifications={expanded}
            />
          )}
        </div>

        <Spinner isVisible />

        {
          isLoading
            ? <Delay time={1000}>
              <Spinner isVisible />
            </Delay>
            : null
        }
      </div>
    )
  }
}

Notifications.propTypes = propTypes

export default Notifications
