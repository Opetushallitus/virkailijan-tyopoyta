import React, { PropTypes } from 'react'

import CloseButton from './buttons/CloseButton'
import { translate } from './Translations'

const types = ['info', 'success', 'warning', 'error', 'help']

const propTypes = {
  id: PropTypes.number.isRequired,
  type: PropTypes.oneOf(types),
  titleKey: PropTypes.string.isRequired,
  textKey: PropTypes.string,
  onCloseButtonClick: PropTypes.func
}

const defaultProps = {
  type: 'info',
  textKey: null,
  onCloseButtonClick: null
}

function Alert (props) {
  const {
    id,
    type,
    titleKey,
    textKey,
    onCloseButtonClick
  } = props

  const handleCloseButtonClick = () => onCloseButtonClick(id)

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-container">
        {
          onCloseButtonClick
            ? <CloseButton onClick={handleCloseButtonClick} />
            : null
        }

        <div className="alert-title">{translate(titleKey)}</div>

        {
          textKey
            ? <div className="alert-text">{translate(textKey)}</div>
            : null
        }
      </div>
    </div>
  )
}

Alert.propTypes = propTypes
Alert.defaultProps = defaultProps

export default Alert
