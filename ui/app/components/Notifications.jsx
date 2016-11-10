import React from 'react'
import _ from 'lodash'

const Notifications = ({notifications, filter, controller, expandedNotifications}) => {

  const filtered = notifications.filter(n => n.text.indexOf(filter) !== -1);

  return(
    <div className="notifications">
      <div className="searchControls">
        <input className="text-input" value={filter} placeholder="Hakusana" type="text" onChange={e => controller.updateSearch(e.target.value)}/>
        <div className="tag-list">
          <span>Näytä</span>
          {['ohje', 'materiaali', 'tiedote', 'hairiotiedote', 'aikataulupaatos'].map(t => <span key={t} className={"large-tag "+t}>{t}</span>)}
        </div>
      </div>
      <div>
        {filtered.map(n => <Notification key={n.id} notification={n} expandedNotifications={expandedNotifications} controller={controller}/>)}
      </div>
    </div>
  )
};

export default Notifications;

const Notification = ({notification, expandedNotifications, controller}) => {
  const shortPost = _.truncate(notification.text, {length: 100});
  const expanded = expandedNotifications.indexOf(notification.id) > -1;

  return(
    <div className={"notification "+notification.type}>
      <div className="">
        <span className="notificationTitle"> {notification.title}</span>
        <span className={"expandNotification " + (expanded ? "icon-angle-up" : "icon-angle-down")}
              onClick={() => controller.toggleNotification(notification.id)}/>
      </div>
      <p>{expanded ? notification.text : shortPost}</p>
      <div>
        <span key={notification.id} className={"small-tag "+notification.type}>{_.upperCase(notification.type)}</span>
        {notification.tags.map(t => <span key={notification.id+'.'+t} className={"small-tag"}>{_.upperCase(t)}</span>)}
      </div>
      <div> {notification.created} {notification.creator}</div>
    </div>
  )
}