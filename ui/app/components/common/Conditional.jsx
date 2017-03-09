import React, { PropTypes } from 'react'

const propTypes = {
  isRendered: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
}

function Conditional (props) {
  const {
    isRendered,
    children
  } = props

  if (isRendered) {
    return (
      <div>
        {children}
      </div>
    )
  } else {
    return null
  }
}

Conditional.propTypes = propTypes

export default Conditional
