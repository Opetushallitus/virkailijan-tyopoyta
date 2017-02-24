import React, { PropTypes } from 'react'
import Icon from '../Icon'

const propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  checked: PropTypes.bool,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired
}

const defaultProps = {
  value: null,
  checked: false
}

function Checkbox (props) {
  const {
    label,
    checked,
    value,
    onChange
  } = props

  return (
    <label className="checkbox">
      <input
        className="hide"
        type="checkbox"
        checked={checked}
        value={value}
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
