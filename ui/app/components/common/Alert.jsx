import React, { PropTypes } from 'react'

import CloseButton from './buttons/CloseButton'

const types = ['info', 'success', 'warning', 'error', 'help']
const positions = ['top', 'right', 'bottom', 'left']

const propTypes = {
  type: PropTypes.oneOf(types),
  position: PropTypes.oneOf(positions),
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  onCloseButtonClick: PropTypes.func.isRequired
}

const defaultProps = {
  type: 'info',
  position: null,
  variant: 'fullscreen',
  text: null
}

function Alert (props) {
  const {
    type,
    position,
    onCloseButtonClick,
    title,
    text
  } = props

  return (
    <div className={`alert alert-${type} ${position ? `alert-${position}` : ''}`}>
      <div className="alert-container">
        <CloseButton onClick={onCloseButtonClick} />

        <div className="alert-heading">{title}</div>

        {
          text
            ? <div className="alert-text">{text}</div>
            : null
        }
      </div>
    </div>
  )
}

Alert.propTypes = propTypes
Alert.defaultProps = defaultProps

export default Alert
