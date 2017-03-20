import React, { PropTypes } from 'react'
import Bacon from 'baconjs'
import R from 'ramda'

// Components
import Notification from './Notification'
import NotificationTagSelect from './NotificationTagSelect'
import NotificationCategoryCheckboxes from './NotificationCategoryCheckboxes'
import Collapse from '../common/Collapse'
import Delay from '../common/Delay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

import getItemsForIDs from '../utils/getItemsForIDs'

const propTypes = {
  controller: PropTypes.object.isRequired,
  defaultLocale: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  notifications: PropTypes.object.isRequired,
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

  // TODO: Only update when new notifications or tags/categories are loaded

  componentDidMount () {
    // Get next page when scrolling to placeholder notification in bottom of the list
    Bacon
      .fromEvent(window, 'scroll')
      .debounce(100)
      .onValue(() => this.autoLoadNotifications())
  }

  getNextPage () {
    const {
      currentPage,
      isLoading
    } = this.props.notifications

    // Check if a new page is already being loaded
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

    const isPlaceholderVisible = window.scrollY >=
      document.body.scrollHeight - window.innerHeight - this.placeholderNotification.clientHeight

    if (isPlaceholderVisible) {
      this.getNextPage()
    }
  }

  isLastPageLoaded () {
    const {
      items,
      count
    } = this.props.notifications

    return items.length <= count
  }

  render () {
    const {
      controller,
      defaultLocale,
      user,
      notifications,
      tagGroups,
      categories
    } = this.props

    const {
      items,
      count,
      isLoading,
      hasLoadingFailed
    } = notifications

    const getNotificationSelectedCategoriesString = (categoriesAmount) => {
      return categoriesAmount === 0
        ? translate('eirajoituksia')
        : categoriesAmount
    }

    return (
      <div>
        <h2 className="hide">{translate('tiedotteet')}</h2>

        {/*Filter notifications by tags*/}
        <div className="mb1">
          <NotificationTagSelect
            tagGroups={tagGroups}
            selectedTags={notifications.tags}
            selectedCategories={notifications.categories}
            controller={controller}
          />
        </div>

        {/*Filter notifications by categories*/}
        <Collapse
          id="collapseNotificationCategories"
          title={`${translate('rajoitanakyviatiedotteita')}
          (${getNotificationSelectedCategoriesString(notifications.categories.length)})`}
        >
          <NotificationCategoryCheckboxes
            controller={controller}
            categories={categories}
            selectedCategories={notifications.categories}
          />
        </Collapse>

        {/*Notifications list*/}
        {
          hasLoadingFailed
            ? <div className="h3 center muted mb2">{translate('tiedotteidenhakuepaonnistui')}</div>
            : null
        }

        {
          isLoading && count === 0
            ? <Delay time={1000}>
              <Spinner isVisible />
            </Delay>
            : null
        }

        {
          !hasLoadingFailed && !isLoading && count === 0
            ? <div className="h3 center muted">{translate('eitiedotteita')}</div>
            : null
        }

        {
          count > 0
            ? <div>
              {items.map(notification =>
                <Notification
                  defaultLocale={defaultLocale}
                  key={`notification${notification.id}`}
                  controller={controller}
                  user={user}
                  notification={notification}
                  categories={getItemsForIDs(notification.categories.sort(), categories.items)}
                  tagGroups={getItemsForIDs(notification.tags.sort(), R.flatten(R.pluck('items', tagGroups.items)))}
                />
              )}

              {
                this.isLastPageLoaded()
                  ? null
                  : <div>
                    <div
                      ref={placeholderNotification => (this.placeholderNotification = placeholderNotification)}
                      className="mb3 p3 rounded bg-white box-shadow"
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
