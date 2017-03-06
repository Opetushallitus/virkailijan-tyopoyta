import React, { PropTypes } from 'react'

// Components
import Button from './Button'
import Icon from '../Icon'
import { translate } from '../Translations'

const propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired
}

const defaultProps = {
  id: '',
  className: ''
}

function EditButton (props) {
  const {
    id,
    className,
    onClick
  } = props

  return (
    <Button
      id={id}
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
