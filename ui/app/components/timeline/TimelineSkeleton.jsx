import React from 'react'

import Spinner from '../common/Spinner'
import Delay from '../common/Delay'
import { translate } from '../common/Translations'

function TimelineSkeleton (props) {
  return (
    <div className="timeline timeline-line relative">
      <div className="sm-center md-left-align lg-center relative">
        <div
          className="timeline-heading h6 caps regular center mt3 mb0 p1
          inline-block rounded white bg-blue-darken"
        >
          <span className="invisible">{translate('hetkinen')}</span>
        </div>

        <div className="flex flex-column">
          <div className="timeline-day relative col-12 sm-col-6 md-col-12 lg-col-6">
            <div className="timeline-item p3 relative rounded bg-blue">
              <span className="invisible">{translate('hetkinen')}</span>
            </div>
          </div>

          <div className="timeline-day relative col-12 sm-col-6 md-col-12 lg-col-6">
            <div className="timeline-item p3 relative rounded bg-blue">
              <span className="invisible">{translate('hetkinen')}</span>
            </div>
          </div>
        </div>

        <Delay time={1000}>
          <Spinner isVisible />
        </Delay>
      </div>
    </div>
  )
}

export default TimelineSkeleton
