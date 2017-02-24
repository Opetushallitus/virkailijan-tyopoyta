import React, { PropTypes } from 'react'

import Delay from '../Delay'
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
      className={`oph-button ${className}`}
      type="button"
      {...rest}
    >
      {isLoading
        ? <Delay time={1000}>
          <Spinner
            variant="in-button"
            isVisible
            delay=""
          />
        </Delay>
        : null
      }
      {children}
    </button>
  )
}

Button.propTypes = propTypes
Button.defaultProps = defaultProps

export default Button
