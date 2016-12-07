import React from 'react'
import R from 'ramda'
import renderHTML from 'react-render-html';


const Notifications = ({notifications, filter, controller, expandedNotifications}) => {

  const filtered = notifications.filter(n => n.content.fi.text.indexOf(filter) !== -1);

  return(
    <div className="notifications">
      <div className="searchControls">
        <input className="text-input" value={filter} placeholder="Hakusana" type="text" onChange={e => controller.updateSearch(e.target.value)}/>
        <div className="tag-list">
          <span>Pikavalinta</span>
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

const truncate = len => R.when(
    R.propSatisfies(R.gt(R.__, len), 'length'),
    R.pipe(R.take(len), R.append('…'), R.join(''))
  );

const Notification = ({notification, expandedNotifications, controller}) => {

  //TODO: do not use regex
  const shortPost = truncate(100)(notification.content.fi.text.replace(/(<([^>]+)>)/ig,""));
  const expanded = expandedNotifications.indexOf(notification.id) > -1;

  return(
    <div className={"notification "+notification.type}>
      <div className="">
        <span className="notificationTitle"> {notification.content.fi.title}</span>
        <span className={"expandNotification " + (expanded ? "icon-angle-up" : "icon-angle-down")}
              onClick={() => controller.toggleNotification(notification.id)}/>
      </div>
        <div>{expanded ? renderHTML(notification.content.fi.text) : shortPost}</div>
      <div>
        <span key={notification.id} className={"small-tag "+notification.type}>TYYPPI</span>
        {notification.tags.map(t => <span key={notification.id +'.'+t.name_fi} className={"small-tag"}>{R.toUpper(t.name_fi)}</span>)}
      </div>
      <div> {notification.created} {notification.creator}</div>
    </div>
  )
}