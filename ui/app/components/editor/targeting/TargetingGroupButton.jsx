import React, { PropTypes } from 'react'

import { translate } from '../../common/Translations'

const propTypes = {
  id: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired
}

const defaultProps = {
  disabled: false
}

function TargetingGroupButton (props) {
  const {
    id,
    text,
    disabled,
    onClick,
    isActive
  } = props

  const handleClick = () => {
    onClick(id)
  }

  return (
    <button
      className={`oph-button editor-targeting-group-button ${isActive ? 'oph-blue-lighten-2' : 'oph-black'}`}
      disabled={disabled}
      type="button"
      onClick={handleClick}
    >
      {/*Checkmark in active item*/}
      <span className={isActive ? '' : 'display-none'}>{'\u2713'}&nbsp;</span>

      {text}

      {/*Visually hidden text for active item*/}
      <span className={isActive ? 'hide' : 'display-none'}>{translate('valittu')}</span>
    </button>
  )
}

TargetingGroupButton.propTypes = propTypes
TargetingGroupButton.defaultProps = defaultProps

export default TargetingGroupButton
