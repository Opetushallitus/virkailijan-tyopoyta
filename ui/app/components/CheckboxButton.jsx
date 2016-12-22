import React from 'react'

import Icon from './Icon'

const defaultClassList = [
  "checkbox-button-text",
  "inline-block",
  "border",
  "border-widen-1",
  "border-primary",
  "rounded",
  "bg-white primary"
]

function CheckboxButton (props) {
  const {
    id,
    classList,
    label,
    isChecked,
    onChange
  } = props

  return (
    <label
      className="checkbox-button"
      htmlFor={id}
    >
      <input
        id={id}
        className="hide"
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
      />

      <span className={`${defaultClassList.join(' ')} ${classList}`}>
        <Icon classList="checkbox-button-icon-is-not-checked mr1" name="square-o" />
        <Icon classList="checkbox-button-icon-is-checked mr1" name="check-square-o" />

        {label}
      </span>
    </label>
  )
}

export default CheckboxButton
