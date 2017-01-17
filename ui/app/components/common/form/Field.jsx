import React, { PropTypes } from 'react'

const propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  isRequired: PropTypes.bool,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  isRequired: false
}

function Field (props) {
  const {
    name,
    label,
    isRequired,
    children
  } = props

  return (
    <div className={`field ${isRequired ? 'field-is-required' : ''}`}>
      <label
        className="label"
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
