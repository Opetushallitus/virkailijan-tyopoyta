import React, { PropTypes } from 'react'

import UnpublishedNotification from './UnpublishedNotification'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  notifications: PropTypes.array.isRequired
}

function UnpublishedNotifications (props) {
  const {
    controller,
    locale,
    notifications
  } = props

  return (
    <div className="px3">
      <h2>{translate('julktiedotteet')}</h2>

      <div className="bold flex flex-wrap xs-hide sm-hide mb2">
        {/*Headers*/}
        <div className="col-6">
          {translate('otsikko')}
        </div>

        <div className="col-2">
          {translate('luotu')}
        </div>

        <div className="col-2">
          {translate('julkaistaan')}
        </div>

        <div className="col-2">
          {translate('luonut')}
        </div>
      </div>

      {notifications.map(notification =>
        <UnpublishedNotification
          key={notification.id}
          locale={locale}
          notification={notification}
          onTitleClick={controller.toggleUnpublishedNotifications}
        />
      )}
    </div>
  )
}

UnpublishedNotifications.propTypes = propTypes

export default UnpublishedNotifications
