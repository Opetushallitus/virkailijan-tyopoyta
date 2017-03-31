import React, { PropTypes } from 'react'

const propTypes = {
  name: PropTypes.string.isRequired,
  selectedTab: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  className: '',
  selectedTab: ''
}

function TabItem (props) {
  const {
    name,
    selectedTab,
    onClick,
    children
  } = props

  const handleClick = event => {
    event.preventDefault()

    onClick(name)
  }

  return (
    <a
      className={`oph-tab-item ${selectedTab === name ? 'oph-tab-item-is-active' : ''}`}
      href={`#${name}`}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}

TabItem.propTypes = propTypes
TabItem.defaultProps = defaultProps

export default TabItem
