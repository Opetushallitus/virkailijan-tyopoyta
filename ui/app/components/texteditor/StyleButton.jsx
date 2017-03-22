import React, { PropTypes } from 'react'

import Button from '../common/buttons/Button'
import Icon from '../common/Icon'

const propTypes = {
  label: PropTypes.string.isRequired,
  style: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired
}

const defaultProps = {
  isActive: false
}

function StyleButton (props) {
  const {
    label,
    style,
    icon,
    isActive,
    onClick
  } = props

  const handleOnClick = () => {
    onClick(style)
  }

  return (
    <Button
      className={`button-icon RichEditor-styleButton ${isActive ? 'button-link-is-active' : 'gray'}`}
      title={label}
      onClick={handleOnClick}
    >
      <Icon name={icon} />
      <span className="hide">{label}</span>
    </Button>
  )
}

StyleButton.propTypes = propTypes
StyleButton.defaultProps = defaultProps

export default StyleButton
