import React, { PropTypes } from 'react'

// Components
import Button from './Button'
import { translate } from '../Translations'

const propTypes = {
  title: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired
}

const defaultProps = {
  disabled: false,
  title: 'sulje'
}

function CloseButton (props) {
  const {
    disabled,
    title,
    onClick
  } = props

  return (
    <Button
      variants={['close']}
      title={translate(title)}
      aria-label={translate(title)}
      disabled={disabled}
      onClick={onClick}
    >
      <span aria-hidden>&times;</span>
    </Button>
  )
}

CloseButton.propTypes = propTypes
CloseButton.defaultProps = defaultProps

export default CloseButton
