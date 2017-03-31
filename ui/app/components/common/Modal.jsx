import React, { PropTypes } from 'react'

import CloseButton from './buttons/CloseButton'
import { translate } from './Translations'

const variants = ['big']

const propTypes = {
  variant: PropTypes.oneOf(variants),
  title: PropTypes.string.isRequired,
  isCloseDisabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onCloseButtonClick: PropTypes.func.isRequired
}

const defaultProps = {
  variant: '',
  isCloseDisabled: false
}

class Modal extends React.Component {
  constructor (props) {
    super(props)

    this.handleEscKeyUp = this.handleEscKeyUp.bind(this)
    this.handleOverlayClick = this.handleOverlayClick.bind(this)
    this.handleBackToTopLinkClick = this.handleBackToTopLinkClick.bind(this)
  }

  componentDidMount () {
    // Focus on overlay when opening it
    this.overlay.focus()

    // Animate the overlay
    this.overlay.classList.add('oph-overlay-bg')

    this.overlay.addEventListener('keyup', this.handleEscKeyUp)
  }

  componentWillUnmount () {
    this.overlay.removeEventListener('keyup', this.handleEscKeyUp)
  }

  // Close modal on esc key press
  handleEscKeyUp (event) {
    const isEscKey = event.which === 27

    if (isEscKey && !this.props.isCloseDisabled) {
      this.props.onCloseButtonClick()
    }
  }

  // Close modal on clicking the overlay if closing isn't disabled
  handleOverlayClick (event) {
    if (!this.modal.contains(event.target) && !this.props.isCloseDisabled) {
      this.props.onCloseButtonClick()
    }
  }

  // Focus to overlay when clicking / focusing out from 'Back to dialog top' link for keyboard usability
  handleBackToTopLinkClick (event) {
    event.preventDefault()

    this.overlay.focus()
  }

  render () {
    const {
      title,
      variant,
      isCloseDisabled,
      onCloseButtonClick,
      children
    } = this.props

    return (
      <div
        ref={overlay => (this.overlay = overlay)}
        className="oph-overlay oph-overlay-is-visible"
        role="dialog"
        tabIndex="-1"
        aria-labelledby={`#modal-${title}`}
        onClick={this.handleOverlayClick}
      >
        <div
          ref={modal => (this.modal = modal)}
          className={`oph-modal ${variant === '' ? '' : `oph-modal-${variant}`}`}
          role="document"
        >
          <h1 id={`#modal-${title}`} className="hide">{title}</h1>

          <CloseButton
            disabled={isCloseDisabled}
            onClick={onCloseButtonClick}
          />

          {/*Modal content*/}
          {children}

          {/*'Back to dialog top' link*/}
          <a
            className="oph-link oph-modal-back-to-top-link absolute bottom-0 right-0 mb1 mr2 is-visible-on-focus"
            href="#"
            onClick={this.handleBackToTopLinkClick}
            onBlur={this.handleBackToTopLinkClick}
          >
            {translate('palaadialoginalkuun')}
          </a>
        </div>
      </div>
    )
  }
}

Modal.propTypes = propTypes
Modal.defaultProps = defaultProps

export default Modal
