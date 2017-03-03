import React from 'react'

import Spinner from '../common/Spinner'
import Delay from '../common/Delay'

function NotificationsPlaceholder (props) {
  return (
    <div>
      <div className="mb3 p3 rounded bg-white box-shadow" />
      <div className="mb3 p3 rounded bg-white box-shadow" />

      <Delay time={1000}>
        <Spinner isVisible />
      </Delay>
    </div>
  )
}

export default NotificationsPlaceholder
