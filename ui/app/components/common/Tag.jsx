import React, { PropTypes } from 'react'

const propTypes = {
  text: PropTypes.string.isRequired
}

const classList = [
  'h6',
  'caps',
  'inline-block',
  'mr1',
  'mb1',
  'px1',
  'rounded',
  'white',
  'bg-gray-lighten-1'
]

function Tag (props) {
  return (
    <span className={classList.join(' ')}>
      {props.text}
    </span>
  )
}

Tag.propTypes = propTypes

export default Tag
