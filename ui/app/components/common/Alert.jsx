import React, { PropTypes } from 'react'

import CloseButton from './buttons/CloseButton'

const types = ['info', 'success', 'warning', 'error', 'help']

const propTypes = {
  id: PropTypes.number,
  type: PropTypes.oneOf(types),
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  onCloseButtonClick: PropTypes.func.isRequired
}

const defaultProps = {
  id: null,
  type: 'info',
  variant: 'fullscreen',
  text: null
}

function Alert (props) {
  const {
    id,
    type,
    title,
    text,
    onCloseButtonClick
  } = props

  const handleCloseButtonClick = () => onCloseButtonClick(id)

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-container">
        <CloseButton onClick={handleCloseButtonClick} />

        <div className="alert-title">{title}</div>

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
