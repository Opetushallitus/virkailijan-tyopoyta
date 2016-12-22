import React from 'react'
import R from 'ramda'
import renderHTML from 'react-render-html'

// Components
import Tag from '../Tag'
import Icon from '../Icon'
import Button from '../Button'
import EditButton from '../EditButton'

const truncate = len => R.when(
  R.propSatisfies(R.gt(R.__, len), 'length'),
  R.pipe(R.take(len), R.append('…'), R.join(''))
);

function Notification(props) {
  const { 
    locale,
    notification,
    tags,
    expandedNotifications,
    controller
  } = props

  const classList = [
    `notification-${notification.type}`,
    "relative",
    "mt3",
    "pt2",
    "px2",
    "pb1",
    "border",
    "border-gray-lighten-3",
    "rounded",
    "bg-white",
    "box-shadow"
  ]

  const content = notification.content[locale]

  //TODO: do not use regex
  const excerpt = truncate(100)(content.text.replace(/(<([^>]+)>)/ig, ''))
  const expanded = expandedNotifications.indexOf(notification.id) > -1

  return (
    <div className={classList.join(' ')}>
      {/*Title*/}
      <h3 className="h4 primary bold inline-block mb2">
        {content.title}
      </h3>

      {/*'Show more/less' button*/}
      <Button
        classList="button-link absolute top-0 right-0"
        title={expanded ? 'Näytä vain katkelma' : 'Näytä koko tiedote'}
        onClick={() => controller.toggleNotification(notification.id)}
      >
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} />
        <span className="sr-only">
          { expanded
            ? 'Näytä vain katkelma'
            : 'Näytä koko tiedote'
          }
        </span>
      </Button>

      {/*Edit button*/}
      <EditButton
        className="absolute bottom-0 right-0"
        onClick={() => controller.toggleEditor(true, notification.releaseId)}
      />

      {/*Content*/}
      {
        expanded
          ? renderHTML(content.text)
          : <div className="mb2">{excerpt}</div>
      }

      {/*Publish date and publisher's initials*/}
      <span className={`h6 mb1 muted ${!notification.tags.length ? "inline-block" : ""}`}>
        <time className="mr1">{notification.created}</time>
        {notification.creator}
      </span>

      {/*Tags*/}
      <span className="ml2">
        {tags.filter(tag => { return notification.tags.indexOf(tag.id) >= 0 }).map(tag =>
          <Tag
            key={`notification.id.${tag.id}`}
            text={tag['name_' + locale]}
          />
        )}
      </span>
    </div>
  )
}

export default Notification
