import React, { PropTypes } from 'react'

const propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  className: ''
}

function Tabs (props) {
  return (
    <div className={`tabs ${props.className}`}>
      {props.children}
    </div>
  )
}

Tabs.propTypes = propTypes
Tabs.defaultProps = defaultProps

export default Tabs
