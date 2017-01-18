import React, { PropTypes } from 'react'

const propTypes = {
  name: PropTypes.string.isRequired,
  selectedTab: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  selectedTab: ''
}

function TabItem (props) {
  const {
    name,
    selectedTab,
    onClick,
    children
  } = props

  const handleOnClick = event => {
    event.preventDefault()

    onClick(name)
  }

  return (
    <a
      className={`tab-item ${selectedTab === name ? 'tab-item-is-active' : ''}`}
      href={`#${name}`}
      onClick={handleOnClick}
    >
      {children}
    </a>
  )
}

TabItem.propTypes = propTypes
TabItem.defaultProps = defaultProps

export default TabItem
