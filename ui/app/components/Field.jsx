import React from 'react'

function Field (props) {
  const {
    classList,
    label,
    name,
    isRequired
  } = props

  return (
    <div className={`field ${isRequired ? 'field-is-required' : ''} ${classList ? classList : ''}`}>
      <label
        className="label"
        htmlFor={name}
      >
        {label}
      </label>

      {props.children}
    </div>
  )
}

export default Field
