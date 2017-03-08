import React, { PropTypes } from 'react'

const propTypes = {
  className: PropTypes.string,
  text: PropTypes.string.isRequired
}

const defaultProps = {
  className: ''
}

function Tag (props) {
  const classList = [
    'h6',
    'caps',
    'inline-block',
    'mr1',
    'mb1',
    'px1',
    'rounded',
    'white',
    'bg-gray-lighten-1',
    props.className
  ]

  return (
    <span className={classList.join(' ')}>
      {props.text}
    </span>
  )
}

Tag.propTypes = propTypes
Tag.defaultProps = defaultProps

export default Tag
