import React, { PropTypes } from 'react'

import Button from '../../common/buttons/Button'
import Field from '../../common/form/Field'
import { translate } from '../../common/Translations'

const propTypes = {
  url: PropTypes.string,
  selectedLinkText: PropTypes.string,
  selectedText: PropTypes.string,
  confirmLink: PropTypes.func.isRequired
}

const defaultProps = {
  url: '',
  selectedLinkText: '',
  selectedText: ''
}

class EditLink extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      url: props.url
    }

    this.onURLChange = this._onURLChange.bind(this)
    this.onLinkInputKeyDown = this._onLinkInputKeyDown.bind(this)
    this.handleOnClick = this._handleOnClick.bind(this)
  }

  _handleOnClick () {
    this.props.confirmLink(this.state.url, this.props.selectedText)
  }

  _onLinkInputKeyDown (event) {
    if (event.which === 13) {
      this.props.confirmLink(this.state.url, this.props.selectedText)
    }
  }

  _onURLChange (e) {
    this.setState({ url: e.target.value })
  }

  render () {
    const {
      selectedText,
      selectedLinkText
    } = this.props

    return (
      <div
        className="oph-bg-white absolute top-0 right-0 bottom-0 left-0 z2 m2"
        data-selenium-id="edit-link"
      >
        <div className="oph-field">
          <div className="mb1">{translate('linkkiteksti')}</div>
          <div className="oph-muted">{selectedLinkText || selectedText}</div>
        </div>

        <Field
          label={translate('linkkiosoite')}
          name="notification-url"
        >
          <input
            className="oph-input"
            type="url"
            name="notification-url"
            autoFocus
            autoCapitalize={false}
            value={this.state.url}
            onChange={this.onURLChange}
            onKeyDown={this.onLinkInputKeyDown}
          />
        </Field>

        <div className="mt2">
          <Button
            variants={['primary']}
            disabled={!this.state.url}
            onClick={this.handleOnClick}
            data-selenium-id="save-link-button"
          >
            {translate('tallenna')}
          </Button>
        </div>
      </div>
    )
  }
}

EditLink.propTypes = propTypes
EditLink.defaultProps = defaultProps

export default EditLink
