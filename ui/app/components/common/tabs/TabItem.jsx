import React, { PropTypes } from 'react'

const propTypes = {
  name: PropTypes.string.isRequired,
  selectedTab: PropTypes.string,
  column: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  column: '',
  selectedTab: ''
}

function TabItem (props) {
  const {
    name,
    selectedTab,
    column,
    onClick,
    children
  } = props

  const handleClick = event => {
    event.preventDefault()

    onClick(name)
  }

  return (
    <a
      className={`oph-tab-item ${selectedTab === name ? 'oph-tab-item-is-active' : ''} ${column}`}
      href={`#${name}`}
      onClick={handleClick}
      data-selenium-id={`tab-item-${name}`}
    >
      {children}
    </a>
  )
}

TabItem.propTypes = propTypes
TabItem.defaultProps = defaultProps

export default TabItem
