import React, { PropTypes } from 'react'
import R from 'ramda'

import { translate } from '../../common/Translations'

const propTypes = {
  release: PropTypes.object.isRequired,
  timeline: PropTypes.array.isRequired,
  emptyTimelineItems: PropTypes.array.isRequired,
  incompleteTimelineItems: PropTypes.array.isRequired,
  targetingGroups: PropTypes.array.isRequired
}

function ValidationMessages (props) {
  const {
    release,
    timeline,
    emptyTimelineItems,
    incompleteTimelineItems,
    targetingGroups
  } = props

  const notification = release.notification

  return (
    <div className="break-word">
      {/*Release isn't targeted to an user group*/}
      {
        release.userGroups.length === 0
          ? <div className="oph-error oph-bold mb1">
            &middot;&nbsp;
            {translate('kohdennuspuuttuu')}
            {/*Check if at least one tag is selected if notification is incomplete or complete*/}
            {
              (notification.validationState === 'incomplete' ||
              notification.validationState === 'complete') &&
              notification.tags.length === 0
                ? ` ${translate('avainsanapuuttuu')}`
                : null
            }
          </div>
          : null
      }

      {/*Saved targeting group's name isn't unique*/}
      {
        R.contains(release.targetingGroup, targetingGroups)
          ? <div className="oph-error oph-bold mb1">
            &middot; {translate('kohdennusonjoolemassa')} {`"${release.targetingGroup}"`}
          </div>
          : null
      }

      {/*Notification is empty and all timeline items are empty*/}
      {
        release.notification.validationState === 'empty' && emptyTimelineItems.length === timeline.length
          ? <div className="oph-muted mb1">&middot; {translate('taytatiedotetaiaikajana')}</div>
          : null
      }

      {/*Notification is incomplete*/}
      {
        release.notification.validationState === 'incomplete'
          ? <div className="oph-muted mb1">&middot; {translate('tiedotekesken')}</div>
          : null
      }

      {/*Timeline items are incomplete*/}
      {
        incompleteTimelineItems.length
          ? <div className="oph-muted mb1">&middot; {translate('aikajanakesken')}</div>
          : null
      }
    </div>
  )
}

ValidationMessages.propTypes = propTypes

export default ValidationMessages
