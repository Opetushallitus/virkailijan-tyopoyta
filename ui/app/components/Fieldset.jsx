import React from 'react'

function Fieldset (props) {
  const {
    classList,
    legend,
    isRequired
  } = props

  return (
    <fieldset className={`field ${isRequired ? 'field-is-required' : ''} ${classList ? classList : ''}`}>
      <legend
        className="legend"
      >
        {legend}
      </legend>

      {props.children}
    </fieldset>
  )
}

export default Fieldset
