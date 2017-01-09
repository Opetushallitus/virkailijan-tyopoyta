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
    checked,
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
        checked={checked}
        onChange={onChange}
      />

      <span className={`${defaultClassList.join(' ')} ${classList}`}>
        <Icon classList="mr1" name={`${checked ? 'check-' : ''}square-o`} />

        {label}
      </span>
    </label>
  )
}

export default CheckboxButton
