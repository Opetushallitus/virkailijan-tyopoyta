import React from 'react'
import R from 'ramda'
import renderHTML from 'react-render-html'

// Components
import Tag from '../Tag'
import Icon from '../Icon'
import Button from '../Button'
import EditButton from '../EditButton'
import Translation from '../Translations'

const truncate = len => R.when(
  R.propSatisfies(R.gt(R.__, len), 'length'),
  R.pipe(R.take(len), R.append('…'), R.join(''))
)

function Notification(props) {
  const { 
    locale,
    notification,
    tags,
    expandedNotifications,
    controller
  } = props

  const content = notification.content[locale]

  // Strip HTML tags from text
  // TODO: do not use regex
  const parsedText = content.text.replace(/(<([^>]+)>)/ig, '')

  const excerptLength = 100;
  const excerpt = truncate(excerptLength)(parsedText)

  const isExpandable = parsedText.length > excerptLength;
  const expandedNotification = expandedNotifications.indexOf(notification.id) > -1

  const classList = [
    'notification',
    `notification-${notification.type}`,
    `${isExpandable ? 'notification-is-expandable' : ''}`,
    "relative",
    "mt3",
    "pt2",
    "px2",
    "pb1",
    "z1",
    "border",
    "border-gray-lighten-3",
    "rounded",
    "bg-white",
    "box-shadow"
  ]

  return (
    <div className="relative">
      {/*Title for screen readers*/}
      <h3 className="hide">
        {content.title}
      </h3>

      {/*'Show more/less' button*/}
      {/*Display button if text is longer than excerpt length*/}
      {isExpandable
        ?
        <Button
          classList="button-link absolute top-0 right-0 z2 gray-lighten-1"
          title={expandedNotification ? <Translation trans="naytakatkelma"/> : <Translation trans="naytatiedote"/>}
          onClick={() => controller.toggleNotification(notification.id)}
        >
          <Icon name={expandedNotification ? 'chevron-up' : 'chevron-down'} />
          <span className="hide">
              { expandedNotification
                ? <Translation trans="naytakatkelma"/>
                : <Translation trans="naytatiedote"/>
              }
            </span>
        </Button>
        : null
      }

      {/*Edit button*/}
      <EditButton
        className="absolute bottom-0 right-0 z2 gray-lighten-1"
        onClick={() => controller.toggleEditor(true, notification.releaseId)}
      />

      <div className={classList.join(' ')} onClick={() => controller.toggleNotification(notification.id)}>
        {/*Displayed title*/}
        <h3 className="notification-heading h4 primary bold inline-block mb2 mr2" aria-hidden>
          {content.title}
        </h3>

        {/*Content*/}
        <div className="mb2">
          {
            expandedNotification || !isExpandable
              ? renderHTML(content.text)
              : excerpt
          }
        </div>

        {/*Publish date and publisher's initials*/}
        <span className={`h6 mb1 muted ${!notification.tags.length ? "inline-block" : ""}`}>
          <time className="mr1">{notification.created}</time>
          {notification.creator}
        </span>

        {/*Tags*/}
        <span className="mx2">
          {tags.filter(tag => { return notification.tags.indexOf(tag.id) >= 0 }).map(tag =>
            <Tag
              key={`notification.id.${tag.id}`}
              text={tag['name_' + locale]}
            />
          )}
        </span>
      </div>
    </div>
  )
}

export default Notification
