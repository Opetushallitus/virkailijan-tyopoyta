import React, { PropTypes } from 'react'

import Button from '../../common/buttons/Button'
import { translate } from '../../common/Translations'

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

  const handleClick = () => {
    onClick(id)
  }

  return (
    <Button
      variants={['selected']}
      title={translate('poistakayttooikeusryhma')}
      aria-label={`${translate('poistakayttooikeusryhma')} ${text}`}
      onClick={handleClick}
    >
      <span className="oph-button-selected-text">{text}</span>
      <span className="oph-button-selected-icon" aria-hidden>&times;</span>
    </Button>
  )
}

UserGroupButton.propTypes = propTypes

export default UserGroupButton
