import React, {PropTypes} from 'react'

import Checkbox from '../common/form/Checkbox'
import {translate} from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
}

const defaultProps = {
  value: null,
  checked: false
}

function EmailSettings (props) {
  const {
    controller,
    user
  } = props

  const handleEmailCheckboxChange = event => {
    const value = event.target.checked
    controller.saveSendEmail(value)
  }

  return (
    <div className="flex flex-wrap">
      {/*Display error or checkbox depending on the result of the fetch*/}
      {
        <div className="col-12 sm-col-6 lg-col-4 sm-pr1">
          <Checkbox
            label={translate('enhaluasahkoposteja')}
            checked={user.sendEmail}
            value={user.sendEmail}
            onChange={handleEmailCheckboxChange}
          />
        </div>
      }
    </div>
  )
}

EmailSettings.propTypes = propTypes
EmailSettings.defaultProps = defaultProps

export default EmailSettings
