import React from 'react'

function Checkbox (props) {
  const {
    className,
    label
  } = props

  return (
    <label className={`checkbox ${className ? className : ''}`}>
      <input type="checkbox" />
      {label}
    </label>
  )
}

export default Checkbox
