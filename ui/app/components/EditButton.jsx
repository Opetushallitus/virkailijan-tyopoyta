import React from 'react'

import Button from './Button'
import Icon from './Icon'

function EditButton (props) {
  const {
    className,
    onClick
  } = props;

  return (
    <Button
      classList={`button-link ${className}`}
      title="Muokkaa"
      onClick={onClick}
    >
      <Icon name="pencil" />
      <span className="hide">Muokkaa</span>
    </Button>
  )
}

export default EditButton;
