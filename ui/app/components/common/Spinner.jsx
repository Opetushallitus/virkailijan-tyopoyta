import React, { PropTypes } from 'react'
import { translate } from './Translations'

const variants = ['in-button']

const propTypes = {
  variant: PropTypes.oneOf(variants),
  isVisible: PropTypes.bool
}

const defaultProps = {
  variant: null,
  isVisible: false
}

function Spinner (props) {
  const {
    variant,
    isVisible
  } = props

  return (
    <div
      className={`
        ${isVisible ? 'oph-spinner' : 'display-none'}
        ${variant ? `oph-spinner-${variant}` : ''}
      `}
      aria-label={translate('hetkinen')}
    >
      <div className="oph-bounce oph-bounce1" aria-hidden />
      <div className="oph-bounce oph-bounce2" aria-hidden />
      <div className="oph-bounce oph-bounce3" aria-hidden />
    </div>
  )
}

Spinner.propTypes = propTypes
Spinner.defaultProps = defaultProps

export default Spinner
