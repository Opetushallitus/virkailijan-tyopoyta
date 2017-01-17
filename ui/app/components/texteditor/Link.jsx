import React, { PropTypes } from 'react'
import { Entity } from 'draft-js'

const propTypes = {
  entityKey: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

function Link (props) {
  const url = Entity.get(props.entityKey).getData()

  return (
    <a href={url} title={url}>
      {props.children}
    </a>
  )
}

Link.propTypes = propTypes

export default Link
