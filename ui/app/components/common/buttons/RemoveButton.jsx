import React, { PropTypes } from 'react'

// Components
import Button from './Button'
import Icon from '../Icon'
import { translate } from '../Translations'

const propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func.isRequired
}

const defaultProps = {
  id: '',
  className: '',
  title: 'poista'
}

function RemoveButton (props) {
  const {
    id,
    className,
    title,
    onClick
  } = props

  return (
    <Button
      id={id}
      className={`button-icon gray ${className}`}
      title={translate(title)}
      aria-label={translate(title)}
      onClick={onClick}
    >
      <Icon name="trash" />
    </Button>
  )
}

RemoveButton.propTypes = propTypes
RemoveButton.defaultProps = defaultProps

export default RemoveButton
