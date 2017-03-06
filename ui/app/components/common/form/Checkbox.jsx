import React, { PropTypes } from 'react'
import Icon from '../Icon'

const propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
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
        className="checkbox-input hide"
        type="checkbox"
        checked={checked}
        value={value}
        onChange={onChange}
      />

      <span className="checkbox-text">{label}</span>
      <Icon className="checkbox-icon mr1 primary" name={`${checked ? 'check-' : ''}square-o`} />
    </label>
  )
}

Checkbox.propTypes = propTypes
Checkbox.defaultProps = defaultProps

export default Checkbox
