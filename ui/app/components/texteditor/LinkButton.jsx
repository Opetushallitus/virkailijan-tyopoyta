import React, { PropTypes } from 'react'

import Button from '../common/buttons/Button'
import Icon from '../common/Icon'

const propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired
}

const defaultProps = {
  disabled: false,
  isActive: false
}

function LinkButton (props) {
  const {
    label,
    icon,
    disabled,
    isActive,
    onClick
  } = props

  return (
    <Button
      className={`button-link RichEditor-styleButton ${isActive ? 'button-link-is-active' : 'gray'}`}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={icon} />
      <span className="hide">{label}</span>
    </Button>
  )
}

LinkButton.propTypes = propTypes
LinkButton.defaultProps = defaultProps

export default LinkButton
