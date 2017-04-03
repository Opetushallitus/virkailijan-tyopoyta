import React, { PropTypes } from 'react'

import UnpublishedNotification from './UnpublishedNotification'
import Alert from '../common/Alert'
import Delay from '../common/Delay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  notifications: PropTypes.object.isRequired
}

function UnpublishedNotifications (props) {
  const {
    controller,
    locale,
    notifications
  } = props

  const {
    items,
    alerts,
    isLoading
  } = notifications

  return (
    <div className="px3">
      <h2 className="oph-h2 oph-bold">{translate('julktiedotteet')}</h2>

      {/*Alerts*/}
      <div className={`my3 ${alerts.length > 0 ? '' : 'display-none'}`}>
        {alerts.map(alert =>
          <Alert
            key={alert.id}
            id={alert.id}
            variant={alert.variant}
            title={alert.title}
            text={alert.text}
            onCloseButtonClick={controller.removeAlert}
          />
        )}
      </div>

      {
        isLoading
          ? <Delay time={1000}>
            <Spinner isVisible />
          </Delay>
          : null
      }

      {
        !isLoading && items.length === 0
          ? <span>{translate('eijulkaisemattomiatiedotteita')}</span>
          : <div>
            <div className="oph-bold flex flex-wrap xs-hide sm-hide mb2">
              {/*Headings*/}
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

            {items.map(notification =>
              <UnpublishedNotification
                key={notification.id}
                locale={locale}
                notification={notification}
                onTitleClick={controller.edit}
              />
            )}
          </div>
      }
    </div>
  )
}

UnpublishedNotifications.propTypes = propTypes

export default UnpublishedNotifications
