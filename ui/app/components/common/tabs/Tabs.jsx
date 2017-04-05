import React, { PropTypes } from 'react'

const propTypes = {
  children: PropTypes.node.isRequired
}

function Tabs (props) {
  return (
    <div className="oph-tabs">
      {props.children}
    </div>
  )
}

Tabs.propTypes = propTypes

export default Tabs
