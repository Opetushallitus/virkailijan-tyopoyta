import React, { PropTypes } from 'react'
import Icon from '../Icon'

const propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired
}

const defaultProps = {
  checked: false
}

function Checkbox (props) {
  const {
    label,
    checked,
    onChange
  } = props

  return (
    <label className="checkbox">
      <input
        className="hide"
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />

      <Icon className="mr1 primary" name={`${checked ? 'check-' : ''}square-o`} />
      {label}
    </label>
  )
}

Checkbox.propTypes = propTypes
Checkbox.defaultProps = defaultProps

export default Checkbox
