import React, { PropTypes } from 'react'

import Button from './Button'
import Icon from './Icon'
import Translation from './Translations'

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
      classList={`button-link ${className}`}
      title="Muokkaa"
      onClick={onClick}
    >
      <Icon name="pencil" />
      <span className="hide"><Translation trans="muokkaa "/></span>
    </Button>
  )
}

EditButton.propTypes = propTypes
EditButton.defaultProps = defaultProps

export default EditButton
