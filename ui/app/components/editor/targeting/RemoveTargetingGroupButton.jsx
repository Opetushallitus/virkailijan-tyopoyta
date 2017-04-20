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

function RemoveTargetingGroupButton (props) {
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
      variants={['cancel', 'small']}
      disabled={disabled}
      onClick={handleClick}
      isLoading={isLoading}
    >
      {translate('poista')}
    </Button>
  )
}

RemoveTargetingGroupButton.propTypes = propTypes
RemoveTargetingGroupButton.defaultProps = defaultProps

export default RemoveTargetingGroupButton
