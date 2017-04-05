import React, { PropTypes } from 'react'

import IconButton from '../../common/buttons/IconButton'

const propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  style: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}

const defaultProps = {
  isActive: false
}

function StyleButton (props) {
  const {
    title,
    icon,
    isActive,
    style,
    onClick
  } = props

  const handleClick = () => {
    onClick(style)
  }

  return (
    <IconButton
      title={title}
      icon={icon}
      isActive={isActive}
      onClick={handleClick}
    />
  )
}

StyleButton.propTypes = propTypes
StyleButton.defaultProps = defaultProps

export default StyleButton
