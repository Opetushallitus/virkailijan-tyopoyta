import React, { PropTypes } from 'react'

const propTypes = {
  className: PropTypes.string,
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
    className,
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
      className={`tab-item ${className} ${selectedTab === name ? 'tab-item-is-active' : ''}`}
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
