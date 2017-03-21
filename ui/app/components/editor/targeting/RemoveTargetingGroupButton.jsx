import React, { PropTypes } from 'react'

import Button from '../../common/buttons/Button'
import { translate } from '../../common/Translations'

const propTypes = {
  id: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
}

const defaultProps = {
  disabled: false,
  isLoading: false,
  hasLoadingFailed: false
}

function TargetingGroupButton (props) {
  const {
    id,
    disabled,
    onClick,
    isLoading
  } = props

  const handleClick = () => {
    onClick(id)
  }

  return (
    <Button
      className="oph-button-cancel p1"
      disabled={disabled}
      onClick={handleClick}
      isLoading={isLoading}
    >
      {translate('poista')}
    </Button>
  )
}

TargetingGroupButton.propTypes = propTypes
TargetingGroupButton.defaultProps = defaultProps

export default TargetingGroupButton
