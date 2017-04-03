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
    <label className="oph-checkable">
      <input
        className="oph-checkable-input hide"
        type="checkbox"
        checked={checked}
        value={value}
        onChange={onChange}
      />

      <span className="oph-checkable-text">{label}</span>
      <Icon className="oph-checkable-icon" name={`${checked ? 'check-' : ''}square-o`} />
    </label>
  )
}

Checkbox.propTypes = propTypes
Checkbox.defaultProps = defaultProps

export default Checkbox
