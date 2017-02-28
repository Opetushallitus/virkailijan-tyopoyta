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
      {
        (release.validationState === 'empty' ||
        release.validationState === 'incomplete') &&
        release.notification.validationState === 'empty'
          ? <div className="bold red mb1">&middot; {translate('kohdennuspuuttuu')}</div>
          : null
      }

      {
        (release.validationState === 'empty' ||
        release.validationState === 'incomplete') &&
        (release.notification.validationState === 'incomplete' ||
        release.notification.validationState === 'complete')
          ? <div className="bold red mb1">&middot; {translate('kohdennusjaavainsanapuuttuu')}</div>
          : null
      }

      {
        (release.notification.validationState === 'empty' && emptyTimelineItems.length === timeline.length)
          ? <div className="muted mb1">&middot; {translate('taytatiedotetaiaikajana')}</div>
          : null
      }

      {
        release.notification.validationState === 'incomplete'
          ? <div className="muted mb1">&middot; {translate('tiedotekesken')}</div>
          : null
      }

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
