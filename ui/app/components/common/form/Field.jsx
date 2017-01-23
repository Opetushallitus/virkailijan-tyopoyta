import React, { PropTypes } from 'react'

const propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  isRequired: PropTypes.bool,
  labelIsHidden: PropTypes.bool,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  className: '',
  isRequired: false,
  labelIsHidden: false
}

function Field (props) {
  const {
    className,
    name,
    label,
    labelIsHidden,
    isRequired,
    children
  } = props

  return (
    <div className={`field ${isRequired ? 'field-is-required' : ''} ${className}`}>
      <label
        className={`label ${labelIsHidden ? 'display-none' : ''}`}
        htmlFor={name}
      >
        {label}
      </label>

      {children}
    </div>
  )
}

Field.propTypes = propTypes
Field.defaultProps = defaultProps

export default Field
