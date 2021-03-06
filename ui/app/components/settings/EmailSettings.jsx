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

    !(props.user) && console.warn('props.user is not defined in EmailSettings.constructor')
    !(props.user && props.user.profile) && console.warn('props.user.profile is not defined in EmailSettings.constructor')

    this.state = {
      isDisabled: true,
      isChecked: props.user && props.user.profile && !props.user.profile.sendEmail
    }
  }

  render () {
    const {
      controller
    } = this.props

    if (this.state.isDisabled && this.props.user && this.props.user.profile) {
      this.setState({
        isDisabled: false,
        isChecked: !this.props.user.profile.sendEmail
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
