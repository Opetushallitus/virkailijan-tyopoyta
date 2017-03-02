import React, { PropTypes } from 'react'
import Bacon from 'baconjs'

// Components
import Notification from './Notification'
import NotificationTagSelect from './NotificationTagSelect'
import NotificationsPlaceholder from './NotificationsPlaceholder'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  notifications: PropTypes.object.isRequired,
  tags: PropTypes.object.isRequired
}

class Notifications extends React.Component {
  constructor (props) {
    super(props)

    this.getNextPage = this.getNextPage.bind(this)
    this.isLastPageLoaded = this.isLastPageLoaded.bind(this)
  }

  componentDidMount () {
    // Get next page when scrolling to placeholder notification
    Bacon
      .fromEvent(window, 'scroll')
      .debounce(100)
      .onValue(() => {
        if (this.isLastPageLoaded()) {
          return
        }

        const isPlaceholderVisible = window.scrollY >=
          document.body.scrollHeight - window.innerHeight - this.placeholderNotification.clientHeight

        if (isPlaceholderVisible) {
          this.getNextPage()
        }
      })
  }

  getNextPage () {
    const {
      currentPage,
      isLoading
    } = this.props.notifications

    // Check if new page is already being fetched
    if (isLoading) {
      return
    }

    const nextPage = currentPage + 1

    this.props.controller.getPage(nextPage)
  }

  isLastPageLoaded () {
    const pageLength = 20

    return this.props.notifications.items.length <= pageLength * this.props.notifications.currentPage
  }

  render () {
    const {
      controller,
      locale,
      notifications,
      tags
    } = this.props

    const {
      items,
      expanded,
      isInitialLoad
    } = notifications

    return (
      <div>
        <h2 className="hide">{translate('tiedotteet')}</h2>

        <div className="mb3">
          <NotificationTagSelect
            locale={locale}
            options={tags.items}
            selectedOptions={notifications.tags}
            controller={controller}
            isInitialLoad={isInitialLoad}
            isLoading={tags.isLoading}
          />
        </div>

        {/*Placeholder to display on initial load*/}
        {
          isInitialLoad
            ? <NotificationsPlaceholder />
            : null
        }

        <div className={`notifications ${isInitialLoad ? 'display-none' : ''}`}>
          {
            !isInitialLoad && items.length === 0
              ? <div className="h3 center muted">{translate('eitiedotteita')}</div>
              : null
          }

          {items.map(notification =>
            <Notification
              key={`notification${notification.id}`}
              controller={controller}
              locale={locale}
              notification={notification}
              tags={tags.items}
              expandedNotifications={expanded}
            />
          )}

          {
            this.isLastPageLoaded()
              ? null
              : <div
                ref={placeholderNotification => (this.placeholderNotification = placeholderNotification)}
                className="mb3 p3 rounded bg-white box-shadow"
              />
          }
        </div>

        {
          this.isLastPageLoaded()
            ? null
            : <div className="center py3">
              {/*Visually hidden button for accessibility*/}
              <button
                className="hide"
                type="button"
                onClick={this.getNextPage}
              >
                {translate('naytalisaatiedotteita')}
              </button>

              <Spinner isVisible />
            </div>
        }
      </div>
    )
  }
}

Notifications.propTypes = propTypes

export default Notifications
