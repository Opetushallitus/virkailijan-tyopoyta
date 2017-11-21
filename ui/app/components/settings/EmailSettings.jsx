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

class EmailSettings extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isChecked: props.user.profile.sendEmail
    }
  }

  render () {
    const {
      controller,
      user
    } = this.props

    const handleEmailCheckboxChange = event => {
      const sendEmail = !event.target.checked
      controller.saveSendEmail(sendEmail)
      this.setState({ isChecked: !sendEmail })
    }

    return (
      <div className="flex flex-wrap">
        {/*Display error or checkbox depending on the result of the fetch*/}
        {
          <Checkbox
            label={translate('enhaluasahkoposteja')}
            checked={this.state.isChecked}
            value={user.profile.sendEmail}
            onChange={handleEmailCheckboxChange}
          />
        }
      </div>
    )
  }
}

EmailSettings.propTypes = propTypes
EmailSettings.defaultProps = defaultProps

export default EmailSettings
