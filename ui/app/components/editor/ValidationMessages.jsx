import React, { PropTypes } from 'react'

import { translate } from '../common/Translations'

const propTypes = {
  release: PropTypes.object.isRequired,
  timeline: PropTypes.array.isRequired,
  emptyTimelineItems: PropTypes.array.isRequired,
  incompleteTimelineItems: PropTypes.array.isRequired
}

function ValidationMessages (props) {
  const {
    release,
    timeline,
    emptyTimelineItems,
    incompleteTimelineItems
  } = props

  return (
    <div>
      {/*Release isn't targeted, notification is empty or incomplete and tags are selected*/}
      {
        (release.validationState === 'empty' ||
        release.validationState === 'incomplete') &&
        release.notification.validationState === 'empty' ||
        (release.notification.validationState === 'incomplete' &&
        release.notification.tags.length > 0)
          ? <div className="bold red mb1">&middot; {translate('kohdennuspuuttuu')}</div>
          : null
      }

      {/*Release isn't targeted, notification isn't empty and no tags are selected*/}
      {
        (release.validationState === 'empty' ||
        release.validationState === 'incomplete') &&
        (release.notification.validationState === 'incomplete' ||
        release.notification.validationState === 'complete') &&
        release.notification.tags.length === 0
          ? <div className="bold red mb1">&middot; {translate('kohdennusjaavainsanapuuttuu')}</div>
          : null
      }

      {/*Notification is empty and all timeline items are empty*/}
      {
        (release.notification.validationState === 'empty' && emptyTimelineItems.length === timeline.length)
          ? <div className="muted mb1">&middot; {translate('taytatiedotetaiaikajana')}</div>
          : null
      }

      {/*Notification is incomplete*/}
      {
        release.notification.validationState === 'incomplete'
          ? <div className="muted mb1">&middot; {translate('tiedotekesken')}</div>
          : null
      }

      {/*Timeline items are incomplete*/}
      {
        incompleteTimelineItems.length
          ? <div className="muted mb1">&middot; {translate('aikajanakesken')}</div>
          : null
      }
    </div>
  )
}

ValidationMessages.propTypes = propTypes

export default ValidationMessages
