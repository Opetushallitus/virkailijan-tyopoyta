import React, { PropTypes } from 'react'

const propTypes = {
  text: PropTypes.string.isRequired
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
  return (
    <h2 className={classList.join(' ')}>
      {props.text}
    </h2>
  )
}

TimelineHeading.propTypes = propTypes

export default TimelineHeading
