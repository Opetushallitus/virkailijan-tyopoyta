import React, { PropTypes } from 'react'
import moment from 'moment'

import { translate } from '../common/Translations'

const propTypes = {
  month: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired
}

const classList = [
  'timeline-heading',
  'h6',
  'caps',
  'regular',
  'center',
  'mb0',
  'p1',
  'inline-block',
  'rounded',
  'white',
  'bg-blue-darken'
]

function TimelineHeading (props) {
  const month = moment(props.month, 'M').format('MMMM')

  return (
    <h2 className={classList.join(' ')}>
      {translate(month)} {props.year}
    </h2>
  )
}

TimelineHeading.propTypes = propTypes

export default TimelineHeading
