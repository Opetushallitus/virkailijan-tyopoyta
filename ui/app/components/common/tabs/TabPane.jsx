import React, { PropTypes } from 'react'

const propTypes = {
  name: PropTypes.string,
  isActive: PropTypes.bool,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  name: null,
  isActive: false
}

function TabPane (props) {
  const {
    name,
    isActive,
    children
  } = props

  return (
    <section
      className={`oph-tab-pane ${isActive ? 'oph-tab-pane-is-active' : ''}`}
      data-selenium-id={name ? `tab-${name}` : ''}
    >
      {children}
    </section>
  )
}

TabPane.propTypes = propTypes
TabPane.defaultProps = defaultProps

export default TabPane
