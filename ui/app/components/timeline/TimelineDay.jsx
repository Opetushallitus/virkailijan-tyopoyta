import React from 'react'

import TimelineItem from './TimelineItem'
import Button from '../Button'
import Icon from '../Icon'

function TimelineDay ({ day }) {
  return (
    <div className="timeline-day relative col-12 sm-col-6 md-col-12 lg-col-6">
      <TimelineItem />

      <div className="timeline-event break-word left-align mt1 p2 relative rounded white bg-blue">
        {/*Description*/}
        <div className="h5 pr2">Ylempään ammattikorkeakoulututkintoon ja yliopistojen pelkkään ylempään korkeakoulututkintoon
          johtavien koulutusten osalta...</div>

        {/*Edit button*/}
        {/*<EditButton*/}
          {/*className="absolute top-0 right-0"*/}
        {/*/>*/}
      </div>
    </div>
  )
}

export default TimelineDay;
