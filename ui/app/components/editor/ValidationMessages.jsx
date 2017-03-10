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

  const notification = release.notification

  return (
    <div>
      {/*Release isn't targeted*/}
      {
        release.validationState === 'empty' || release.validationState === 'incomplete'
          ? <div className="bold red mb1">
            &middot;&nbsp;
            {translate('kohdennuspuuttuu')}
            {/*Check if at least one tag is selected if notification is incomplete*/}
            {
              notification.validationState === 'incomplete' && notification.tags.length === 0
                ? ` ${translate('avainsanapuuttuu')}`
                : null
            }
          </div>
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
