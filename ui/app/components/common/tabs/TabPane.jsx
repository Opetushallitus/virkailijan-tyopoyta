import React, { PropTypes } from 'react'

const propTypes = {
  isActive: PropTypes.bool,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  isActive: false
}

function TabPane (props) {
  const {
    isActive,
    children
  } = props

  return (
    <section className={`oph-tab-pane ${isActive ? 'oph-tab-pane-is-active' : ''}`}>
      {children}
    </section>
  )
}

TabPane.propTypes = propTypes
TabPane.defaultProps = defaultProps

export default TabPane
