import React, { PropTypes } from 'react'

import CloseButton from './buttons/CloseButton'

const propTypes = {
  isVisible: PropTypes.bool,
  variant: PropTypes.string,
  onCloseButtonClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  isVisible: false,
  variant: 'regular'
}

function Modal (props) {
  const {
    isVisible,
    variant,
    onCloseButtonClick,
    children
  } = props

  return (
    <div className={`overlay ${isVisible ? 'overlay-is-visible' : 'display-none'}`}>
      <div className={`modal ${variant === 'large' ? 'modal-lg' : ''}`}>
        <div className="modal-dialog">
          <CloseButton onClick={onCloseButtonClick} />

          {isVisible ? children : null}
        </div>
      </div>
    </div>
  )
}

Modal.propTypes = propTypes
Modal.defaultProps = defaultProps

export default Modal
