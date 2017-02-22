import React, { PropTypes } from 'react'

import { translate } from '../common/Translations'

const propTypes = {
  locale: PropTypes.string.isRequired,
  notification: PropTypes.object.isRequired,
  onTitleClick: PropTypes.func.isRequired
}

function UnpublishedNotification (props) {
  const {
    locale,
    notification,
    onTitleClick
  } = props

  const handleTitleClick = (event) => {
    event.preventDefault()
    onTitleClick(notification.releaseId)
  }

  const content = notification.content[locale]

  return (
    <div className="flex flex-wrap mb1">
      {/*Title*/}
      <div className="col-12 md-col-6 mb1 md-pr2">
        <a href="#" onClick={handleTitleClick}>{content.title}</a>
      </div>

      {/*Create date*/}
      <div className="col-12 md-col-2 mb1 md-pr2">
        <span className="md-hide lg-hide">{translate('luotu')}&nbsp;</span>
        {notification.created}
      </div>

      {/*Publishing date*/}
      <div className="col-12 md-col-2 mb1 md-pr2">
        <span className="md-hide lg-hide">{translate('julkaistaan')}&nbsp;</span>
        {notification.startDate}
      </div>

      {/*Created by*/}
      <div className="col-12 md-col-2 mb1 md-pr2">
        {notification.creator}
      </div>
    </div>
  )
}

UnpublishedNotification.propTypes = propTypes

export default UnpublishedNotification