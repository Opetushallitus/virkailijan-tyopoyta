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
    var checked = false;
    if (props.user && props.user.profile) {
      checked = !props.user.profile.sendEmail;
    } else {
      console.warn('props.user or props.user.profile was not defined in EmailSettings.constructor - using fallback');
    }
    this.state = {
      isDisabled: true,
      isChecked: checked
    }
  }

  render () {
    const {
      controller
    } = this.props

    if (this.state.isDisabled && this.state.user && this.state.user.profile) {
      this.setState({
        isDisabled: false,
        isChecked: !this.state.user.profile.sendEmail
      })
    }

    const handleEmailCheckboxChange = event => {
      const sendEmail = !event.target.checked
      controller.saveSendEmail(sendEmail)
      this.setState({isChecked: !sendEmail})
    }

    return (
      <div className="flex flex-wrap">
        {/*Display error or checkbox depending on the result of the fetch*/}
        {
          <Checkbox
            label={translate('enhaluasahkoposteja')}
            disabled={this.state.isDisabled}
            checked={this.state.isChecked}
            value="sendEmail"
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
