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

  const handleClick = event => {
    event.preventDefault()

    onClick(name)
  }

  return (
    <a
      className={`oph-tab-item ${className} ${selectedTab === name ? 'oph-tab-item-is-active' : ''}`}
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
