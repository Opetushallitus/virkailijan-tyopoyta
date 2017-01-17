import React, { PropTypes } from 'react'

const propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  className: ''
}

function Button (props) {
  const {
    className,
    children,
    ...rest
  } = props

  return (
    <button
      className={`button ${className}`}
      type="button"
      {...rest}
    >
      {children}
    </button>
  )
}

Button.propTypes = propTypes
Button.defaultProps = defaultProps

export default Button
