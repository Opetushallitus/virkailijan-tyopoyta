import React from 'react'
import Icon from './Icon'

function Checkbox (props) {
  const {
    className,
    label,
    checked,
    onChange
  } = props

  return (
    <label className={`checkbox ${className ? className : ''}`}>
      <input
        className="hide"
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <Icon classList="mr1 primary" name={`${checked ? 'check-' : ''}square-o`} />

      {label}
    </label>
  )
}

export default Checkbox
