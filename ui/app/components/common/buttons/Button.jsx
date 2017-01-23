import React, { PropTypes } from 'react'

import Spinner from '../Spinner'

const propTypes = {
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  className: '',
  isLoading: false
}

function Button (props) {
  const {
    className,
    isLoading,
    children,
    ...rest
  } = props

  return (
    <button
      className={`button ${className}`}
      type="button"
      {...rest}
    >
      {isLoading ? <Spinner variant="in-button" isVisible /> : null}
      {children}
    </button>
  )
}

Button.propTypes = propTypes
Button.defaultProps = defaultProps

export default Button
