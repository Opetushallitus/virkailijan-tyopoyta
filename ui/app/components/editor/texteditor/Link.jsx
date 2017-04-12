import React, { PropTypes } from 'react'
import { Entity } from 'draft-js'

const propTypes = {
  entityKey: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

function Link (props) {
  const link = Entity.get(props.entityKey).getData()

  return (
    <a className="oph-link" href={link.url} title={link.url}>
      {props.children}
    </a>
  )
}

Link.propTypes = propTypes

export default Link
