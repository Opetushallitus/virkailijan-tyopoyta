import React, { PropTypes } from 'react'

// Components
import Button from './Button'
import Icon from '../Icon'
import { translate } from '../Translations'

const propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired
}

const defaultProps = {
  className: ''
}

function EditButton (props) {
  const {
    className,
    onClick
  } = props

  return (
    <Button
      className={`button-link ${className}`}
      title={translate('muokkaa')}
      onClick={onClick}
    >
      <Icon name="pencil" />

      <span className="hide">{translate('muokkaa')}</span>
    </Button>
  )
}

EditButton.propTypes = propTypes
EditButton.defaultProps = defaultProps

export default EditButton
