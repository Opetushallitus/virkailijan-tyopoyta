import React, { PropTypes } from 'react'

import Delay from '../Delay'
import Spinner from '../Spinner'
import getVariantsString from '../../utils/getVariantsString'

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
        ${getVariantsString('button', variants)}
      `}
      type="button"
      {...rest}
    >
      {isLoading
        ? <Delay time={1000}>
          <Spinner variant="in-button" isVisible />
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
