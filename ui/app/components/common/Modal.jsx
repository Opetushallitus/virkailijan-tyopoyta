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
        className={`overlay ${isVisible ? 'overlay-is-visible' : 'display-none'}`}
        tabIndex="-1"
        role="dialog"
        onClick={this.handleOverlayClick}
      >
        <label className="hide" aria-label>{title}</label>

        <div className={`modal ${variant === 'large' ? 'modal-lg' : ''}`}>
          <div ref={modal => (this.modal = modal)} className="modal-dialog">
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
