import React, { PropTypes } from 'react'

import Button from '../common/buttons/Button'
import { translate } from '../common/Translations'

const propTypes = {
  id: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}

function UserGroupButton (props) {
  const {
    id,
    text,
    onClick
  } = props

  const handleOnClick = () => {
    onClick(id)
  }

  return (
    <Button
      className="button-primary release-usergroup-button left-align
              flex col-12 mb1 border-blue-lighten-3 black bg-blue-lighten-4"
      type="button"
      title={translate('poistakohderyhma')}
      onClick={handleOnClick}
    >
      <span className="regular flex-auto pr1">{text}</span>
      <span className="h3 self-center self-end" aria-hidden>&times;</span>
    </Button>
  )
}

UserGroupButton.propTypes = propTypes

export default UserGroupButton