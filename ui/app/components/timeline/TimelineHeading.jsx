import React, { PropTypes } from 'react'
import moment from 'moment'

import { translate } from '../common/Translations'

const propTypes = {
  month: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired
}

function TimelineHeading (props) {
  const {
    month,
    year
  } = props

  const monthName = moment(month, 'M').format('MMMM')

  return (
    <h2 className="timeline-heading">
      {translate(monthName)} {year}
    </h2>
  )
}

TimelineHeading.propTypes = propTypes

export default TimelineHeading
