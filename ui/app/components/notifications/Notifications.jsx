import React from 'react'
import Bacon from 'baconjs'

// Components
import NotificationTagSelect from './NotificationTagSelect'
import QuickTagSelect from './QuickTagSelect'
import Notification from './Notification'

class Notifications extends React.Component {
  constructor(props) {
    super(props);

    this.getQuickTags = this.getQuickTags.bind(this)
  }

  componentDidMount() {
    // Create a stream from scrolling event
    Bacon
      .fromEvent(this.notifications, 'scroll')
      .debounce(100)
      .onValue((event) => {
        const node = event.target;

        // Check if user has scrolled to the bottom of the notification list - 10%
        const isLoadingHeightBreakpoint = (node.offsetHeight + node.scrollTop) >=
          node.scrollHeight - (node.scrollHeight / 10)

        if (isLoadingHeightBreakpoint) {
          this.props.controller.lazyLoadNotifications({
            node: event.target,
            page: this.props.nextPage,
            isLoading: true
          });
        }
      })
  }

  getQuickTags(tags) {
    return tags.filter(tag => {
      return tag.isQuickTag;
    })
  }

  render() {
    const {
      locale,
      notifications,
      expandedNotifications,
      notificationTags,
      selectedNotificationTags,
      controller,
    } = this.props

    const quickTags = this.getQuickTags(notificationTags)

    //const filtered = notifications.filter(n => n.content.fi.text.indexOf(filter) !== -1)

    return(
      <div
        className="notifications autohide-scrollbar"
        ref={notifications => { this.notifications = notifications }}
      >
        <h2 className="hide">Tiedotteet</h2>

        <div className="alert alert-warning mb3">
          Haku ei ole vielä toiminnassa
        </div>

        <NotificationTagSelect
          locale={locale}
          options={notificationTags}
          selectedOptions={selectedNotificationTags}
          controller={controller}
        />

        <div className="notification-tag-select-container p2 border border-gray-lighten-2 rounded-bottom-left rounded-bottom-right">
          <QuickTagSelect
            locale={locale}
            options={quickTags}
            selectedOptions={selectedNotificationTags}
            controller={controller}
          />
        </div>

        {notifications.map(notification => <Notification
          key={notification.id}
          locale={locale}
          notification={notification}
          tags={notificationTags}
          expandedNotifications={expandedNotifications}
          controller={controller}
        />)}

        {/*<div className="notifications">*/}
          {/*<div className="searchControls">*/}
            {/*<input className="text-input" value={filter} placeholder="Hakusana" type="text" onChange={e => controller.updateSearch(e.target.value)}/>*/}
            {/*<div className="tag-list">*/}
              {/*<span>Pikavalinta</span>*/}
              {/*{['ohje', 'materiaali', 'tiedote', 'hairiotiedote', 'aikataulupaatos'].map(t => <span key={t} className={"large-tag "+t}>{t}</span>)}*/}
            {/*</div>*/}
          {/*</div>*/}
          {/*<div>*/}
            {/*{filtered.map(n => <Notification key={n.id} notification={n} expandedNotifications={expandedNotifications} controller={controller}/>)}*/}
          {/*</div>*/}
        {/*</div>*/}
      </div>
    )
  }
}

export default Notifications
