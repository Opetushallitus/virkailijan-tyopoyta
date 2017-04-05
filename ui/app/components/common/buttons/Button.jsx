import React, { PropTypes } from 'react'

import Delay from '../Delay'
import Spinner from '../Spinner'

const propTypes = {
  variants: PropTypes.array,
  activeClass: PropTypes.string,
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  variants: [],
  activeClass: '',
  className: '',
  isLoading: false
}

function Button (props) {
  const {
    variants,
    className,
    activeClass,
    isLoading,
    children,
    ...rest
  } = props

  return (
    <button
      className={`
        oph-button ${activeClass} ${className}
        ${variants.map(variant => `oph-button-${variant}`).join(' ')}
      `}
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
