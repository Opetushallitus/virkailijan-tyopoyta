import React, { PropTypes } from 'react'

import CloseButton from './buttons/CloseButton'
import { translate } from './Translations'

const variants = [
  'info',
  'success',
  'warning',
  'error',
  'help'
]

const propTypes = {
  id: PropTypes.number,
  variant: PropTypes.oneOf(variants).isRequired,
  titleKey: PropTypes.string.isRequired,
  textKey: PropTypes.string,
  onCloseButtonClick: PropTypes.func
}

const defaultProps = {
  id: null,
  textKey: '',
  onCloseButtonClick: null
}

function Alert (props) {
  const {
    id,
    variant,
    titleKey,
    textKey,
    onCloseButtonClick
  } = props

  const handleCloseButtonClick = () => onCloseButtonClick(id)

  return (
    <div className={`oph-alert oph-alert-${variant}`}>
      <div className="oph-alert-container">
        <div className="oph-alert-title">{translate(titleKey)}</div>

        {
          textKey
            ? <div className="oph-alert-text">{translate(textKey)}</div>
            : null
        }

        {
          onCloseButtonClick
            ? <CloseButton onClick={handleCloseButtonClick} />
            : null
        }
      </div>
    </div>
  )
}

Alert.propTypes = propTypes
Alert.defaultProps = defaultProps

export default Alert
