import React, { PropTypes } from 'react'

const propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string
}

const defaultProps = {
  className: ''
}

// Uses Font Awesome icon classes
function Icon (props) {
  const {
    name,
    className
  } = props

  return (
    <span className={`fa fa-${name} ${className}`} aria-hidden />
  )
}

Icon.propTypes = propTypes
Icon.defaultProps = defaultProps

export default Icon
