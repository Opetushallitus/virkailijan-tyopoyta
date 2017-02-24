import React, { PropTypes } from 'react'

import CloseButton from './buttons/CloseButton'

const propTypes = {
  title: PropTypes.string.isRequired,
  isVisible: PropTypes.bool,
  isCloseDisabled: PropTypes.bool,
  variant: PropTypes.string,
  onCloseButtonClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  isVisible: false,
  isCloseDisabled: false,
  variant: 'regular'
}

class Modal extends React.Component {
  constructor (props) {
    super(props)

    this.handleOverlayClick = this.handleOverlayClick.bind(this)
  }

  // Close modal on clicking the overlay if closing isn't disabled
  handleOverlayClick (event) {
    if (!this.modal.contains(event.target) && !this.props.isCloseDisabled) {
      this.props.onCloseButtonClick()
    }
  }

  render () {
    const {
      title,
      isVisible,
      isCloseDisabled,
      variant,
      onCloseButtonClick,
      children
    } = this.props

    return (
      <div
        className={`oph-overlay ${isVisible ? 'oph-overlay-is-visible' : ''}`}
        tabIndex="-1"
        role="dialog"
        onClick={this.handleOverlayClick}
      >
        <label className="hide" aria-label>{title}</label>

        <div className={`oph-modal ${variant === 'large' ? 'oph-modal-big' : ''}`}>
          <div ref={modal => (this.modal = modal)} className="oph-modal-dialog">
            <CloseButton disabled={isCloseDisabled} onClick={onCloseButtonClick} />

            {/*Modal content*/}
            {isVisible ? children : null}
          </div>
        </div>
      </div>
    )
  }
}

Modal.propTypes = propTypes
Modal.defaultProps = defaultProps

export default Modal
