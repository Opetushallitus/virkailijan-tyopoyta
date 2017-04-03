import React, { PropTypes } from 'react'

const propTypes = {
  id: PropTypes.number.isRequired,
  htmlId: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired
}

const defaultProps = {
  checked: false,
  disabled: false
}

function CheckboxButton (props) {
  const {
    id,
    htmlId,
    label,
    checked,
    disabled,
    onChange
  } = props

  const handleChange = () => {
    onChange(id)
  }

  return (
    <label
      className="oph-checkbox-button"
      htmlFor={`${htmlId}-${id}`}
    >
      <input
        id={`${htmlId}-${id}`}
        className="oph-checkbox-button-input"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
      />

      <span className="oph-checkbox-button-text">{label}</span>
    </label>
  )
}

CheckboxButton.propTypes = propTypes
CheckboxButton.defaultProps = defaultProps

export default CheckboxButton
