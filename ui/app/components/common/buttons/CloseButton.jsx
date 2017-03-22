import React, { PropTypes } from 'react'

// Components
import Button from './Button'
import { translate } from '../Translations'

const propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired
}

const defaultProps = {
  className: '',
  disabled: false,
  title: 'sulje'
}

function CloseButton (props) {
  const {
    className,
    disabled,
    title,
    onClick
  } = props

  return (
    <Button
      className={`oph-button oph-button-close ${className}`}
      title={translate(title)}
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
