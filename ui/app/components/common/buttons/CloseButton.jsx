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
      className={`button-link button-close absolute top-0 right-0 ${className}`}
      title={translate(title)}
      disabled={disabled}
      onClick={onClick}
    >
      &times;

      <span className="hide">{translate(title)}</span>
    </Button>
  )
}

CloseButton.propTypes = propTypes
CloseButton.defaultProps = defaultProps

export default CloseButton
