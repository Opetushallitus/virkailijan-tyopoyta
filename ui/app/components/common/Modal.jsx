import React, { PropTypes } from 'react'

import Button from './buttons/Button'

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
    <div className={`overlay ${isVisible ? 'overlay-is-visible' : ''}`}>
      <div className={`modal ${variant === 'large' ? 'modal-lg' : ''}`}>
        <div className="modal-dialog">
          {/*Close button*/}
          <Button
            className="modal-close-button button-link absolute top-0 right-0"
            onClick={onCloseButtonClick}
            title="Sulje"
          >
            &times;
            <span className="hide">Sulje</span>
          </Button>

          {isVisible ? children : null}
        </div>
      </div>
    </div>
  )
}

Modal.propTypes = propTypes
Modal.defaultProps = defaultProps

export default Modal
