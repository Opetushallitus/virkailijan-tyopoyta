import React, { PropTypes } from 'react'
import Bacon from 'baconjs'
import R from 'ramda'

// Components
import Notification from './Notification'
import NotificationTagSelect from './NotificationTagSelect'
import NotificationCategoryCheckboxes from './NotificationCategoryCheckboxes'
import Delay from '../common/Delay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

import getItemsForIDs from '../utils/getItemsForIDs'

const propTypes = {
  controller: PropTypes.object.isRequired,
  defaultLocale: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  notifications: PropTypes.object.isRequired,
  specialNotifications: PropTypes.object.isRequired,
  tagGroups: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired
}

class Notifications extends React.Component {
  constructor (props) {
    super(props)

    this.getNextPage = this.getNextPage.bind(this)
    this.isLastPageLoaded = this.isLastPageLoaded.bind(this)
    this.autoLoadNotifications = this.autoLoadNotifications.bind(this)
  }

  componentDidMount () {
    // Get next page when scrolling to placeholder notification in bottom of the list
    Bacon
      .fromEvent(window, 'scroll')
      .debounce(100)
      .onValue(() => this.autoLoadNotifications())
  }

  /*
    Get next page after update if placeholder is present and visible, i.e. when deleting notifications
    or when using the app on large displays
  */
  componentDidUpdate () {
    if (this.placeholderNotification) {
      this.autoLoadNotifications()
    }
  }

  getNextPage () {
    const {
      currentPage,
      isLoading
    } = this.props.notifications

    // Check if a new page is already being fetched
    if (isLoading) {
      return
    }

    const nextPage = currentPage + 1

    this.props.controller.getPage(nextPage)
  }

  autoLoadNotifications () {
    if (this.isLastPageLoaded()) {
      return
    }

    // Check if placeholder is visible in the viewport
    const offset = this.placeholderNotification.getBoundingClientRect()

    const isPlaceholderVisible = offset.bottom > 0 &&
      offset.top < (window.innerHeight || document.documentElement.clientHeight)

    if (isPlaceholderVisible) {
      this.getNextPage()
    }
  }

  // Check if there are more notifications to fetch: count on list >= total count of found notifications
  isLastPageLoaded () {
    const {
      items,
      count
    } = this.props.notifications

    return items.length >= count
  }

  render () {
    const {
      controller,
      defaultLocale,
      user,
      notifications,
      specialNotifications,
      tagGroups,
      categories
    } = this.props

    return (
      <div data-selenium-id="notifications">
        <h2 className="hide">{translate('tiedotteet')}</h2>

        {/*Filter notifications by tags*/}
        <div className="mb1" data-selenium-id="notification-tag-groups">
          <NotificationTagSelect
            tagGroups={tagGroups}
            selectedTags={notifications.tags}
            selectedCategories={notifications.categories}
            controller={controller}
          />
        </div>

        {/*Filter notifications by categories*/}
        <div data-selenium-id="notification-categories">
          <NotificationCategoryCheckboxes
            controller={controller}
            categories={categories}
            selectedCategories={notifications.categories}
            isVisible={R.path(['profile', 'firstLogin'], user)}
          />
        </div>

        {/*Notifications list*/}

        {/*Display "No notifications" text when there are no regular/special notifications*/}
        {/*and no selected tags or categories*/}
        {
          !notifications.hasLoadingFailed &&
          !notifications.isLoading &&
          notifications.count === 0 &&
          specialNotifications.items.length === 0 &&
          notifications.tags.length === 0 &&
          notifications.categories.length === 0
            ? <div className="oph-h3 oph-muted center">{translate('eitiedotteita')}</div>
            : null
        }

        {/*Display spinner when notifications or special notifications are being fetched*/}
        {
          (notifications.isLoading && notifications.count === 0) ||
           specialNotifications.isLoading
            ? <div className="mb3">
              <Delay time={1000}>
                <Spinner isVisible />
              </Delay>
            </div>
            : null
        }

        {/*Special notifications, e.g. disruption notifications*/}
        {
          specialNotifications.hasLoadingFailed
            ? <div className="oph-h3 oph-muted center mb2">{translate('hairiotiedotteidenhakuepaonnistui')}</div>
            : null
        }

        {
          specialNotifications.items.length > 0
            ? specialNotifications.items.map((notification, index) =>
              <Notification
                key={`specialNotification${notification.id}`}
                index={index}
                variant={'disruption'}
                defaultLocale={defaultLocale}
                controller={controller}
                user={user}
                notification={notification}
                categories={getItemsForIDs(notification.categories.sort(), categories.items)}
                tags={getItemsForIDs(notification.tags.sort(), R.flatten(R.pluck('tags', tagGroups.items)))}
              />
            )
            : null
        }

        {/*Regular notifications*/}
        {
          notifications.hasLoadingFailed
            ? <div className="oph-h3 oph-muted center mb2">{translate('tiedotteidenhakuepaonnistui')}</div>
            : null
        }

        {/*Display "No notifications for search terms when there are no regular notifications*/}
        {/*and user has selected tags or categories*/}
        {
          !notifications.hasLoadingFailed &&
          !notifications.isLoading &&
          notifications.count === 0 &&
          (notifications.tags.length > 0 ||
          notifications.categories.length > 0)
            ? <div className="oph-h3 oph-muted center">{translate('eitiedotteitahakuehdoilla')}</div>
            : null
        }

        {
          notifications.count > 0
            ? <div>
              {notifications.items.map((notification, index) =>
                <Notification
                  key={`notification${notification.id}`}
                  index={index}
                  defaultLocale={defaultLocale}
                  controller={controller}
                  user={user}
                  notification={notification}
                  categories={getItemsForIDs(notification.categories.sort(), categories.items)}
                  tags={getItemsForIDs(notification.tags.sort(), R.flatten(R.pluck('tags', tagGroups.items)))}
                />
              )}

              {/*Display placeholder and spinner when there are more notifications to fetch*/}
              {
                this.isLastPageLoaded()
                  ? null
                  : <div>
                    <div
                      ref={placeholderNotification => (this.placeholderNotification = placeholderNotification)}
                      className="oph-bg-white mb3 p3 rounded box-shadow"
                    />

                    <div className="center py3">
                      {/*Visually hidden 'Get next page' button for accessibility*/}
                      <button
                        className="hide"
                        type="button"
                        onClick={this.getNextPage}
                      >
                        {translate('naytalisaatiedotteita')}
                      </button>

                      <Spinner isVisible />
                    </div>
                  </div>
              }
            </div>
            : null
        }
      </div>
    )
  }
}

Notifications.propTypes = propTypes

export default Notifications
