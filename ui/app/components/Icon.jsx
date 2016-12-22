import React from 'react'

function Icon (props) {
  return (
    <span className={`fa fa-${props.name} ${props.classList ? props.classList : ''}`} aria-hidden />
  )
}

export default Icon;
