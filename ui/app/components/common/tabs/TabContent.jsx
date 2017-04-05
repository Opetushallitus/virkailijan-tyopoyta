import React, { PropTypes } from 'react'

const propTypes = {
  children: PropTypes.node.isRequired
}

function TabContent (props) {
  return (
    <div className="oph-tab-content">
      {props.children}
    </div>
  )
}

TabContent.propTypes = propTypes

export default TabContent
