import React, { PropTypes } from 'react'

import Button from '../common/buttons/Button'
import Translation from '../common/Translations'

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

  _handleOnClick (url, text) {
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
      <div className="absolute top-0 right-0 bottom-0 left-0 z2 m2 bg-white">
        <div className="field">
          <div className="mb1">
            <Translation trans="linkkiteksti" />
          </div>

          <div className="muted">{selectedLinkText || selectedText}</div>
        </div>

        <div className="field">
          <label className="block mb1" htmlFor="notification-url">
            <Translation trans="linkkiosoite" />
          </label>

          <input
            className="input"
            type="url"
            name="notification-url"
            autoFocus
            autoCapitalize={false}
            value={this.state.url}
            onChange={this.onURLChange}
            onKeyDown={this.onLinkInputKeyDown}
          />
        </div>

        <Button
          className="button-primary"
          disabled={!this.state.url}
          onClick={this.handleOnClick}
        >
          <Translation trans="tallenna" />
        </Button>
      </div>
    )
  }
}

EditLink.propTypes = propTypes
EditLink.defaultProps = defaultProps

export default EditLink
