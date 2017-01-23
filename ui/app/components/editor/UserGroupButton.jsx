import React, { PropTypes } from 'react'

import Button from '../common/buttons/Button'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  id: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired
}

const defaultProps = {
}

function UserGroupButton (props) {
  const {
    controller,
    id,
    text
  } = props

  const handleOnClick = () => {
    controller.toggleReleaseUserGroup(id)
  }

  return (
    <Button
      className="button-primary release-usergroup-button left-align
              col-12 mb1 border-blue-lighten-3 black bg-blue-lighten-4"
      type="button"
      title={translate('poistakohderyhma')}
      onClick={handleOnClick}
    >
      <span className="regular">{text}</span>
      <span className="h3 right" aria-hidden>&times;</span>
    </Button>
  )
}

UserGroupButton.propTypes = propTypes
UserGroupButton.defaultProps = defaultProps

export default UserGroupButton
