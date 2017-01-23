import React, { PropTypes } from 'react'
import { translate } from './Translations'

const propTypes = {
  variant: PropTypes.string,
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
    <div className={`${isVisible ? 'spinner' : 'display-none'} ${variant ? `spinner-${variant}` : ''}`}>
      <span className="hide">{translate('hetkinen')}</span>

      <div className="bounce bounce1" aria-hidden />
      <div className="bounce bounce2" aria-hidden />
      <div className="bounce bounce3" aria-hidden />
    </div>
  )
}

Spinner.propTypes = propTypes
Spinner.defaultProps = defaultProps

export default Spinner
