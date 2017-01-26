import React from 'react'

import Button from './Button'
import Icon from './Icon'
import Translation from './Translations'


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
      <span className="hide"><Translation trans="muokkaa"/></span>
    </Button>
  )
}

export default EditButton;
