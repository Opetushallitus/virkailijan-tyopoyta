import React from 'react'

const classList = [
  "h6",
  "caps",
  "inline-block",
  "mr1",
  "mb1",
  "px1",
  "rounded",
  "white",
  "bg-gray-lighten-1"
]

function Tag (props) {
  return (
    <span className={classList.join(' ')}>
      {props.text}
    </span>
  )
}

export default Tag
