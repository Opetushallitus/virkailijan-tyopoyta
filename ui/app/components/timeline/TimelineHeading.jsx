import React from 'react'

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

export default TimelineHeading
