import React, { PropTypes } from 'react'

const propTypes = {
  isRequired: PropTypes.bool,
  legend: PropTypes.string.isRequired,
  hasError: PropTypes.bool,
  helpTextId: PropTypes.string,
  helpText: PropTypes.string,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  isRequired: false,
  hasError: false,
  helpTextId: '',
  helpText: null
}

function Fieldset (props) {
  const {
    isRequired,
    legend,
    hasError,
    helpTextId,
    helpText,
    children
  } = props

  return (
    <fieldset
      className={`oph-field oph-fieldset ${isRequired ? 'oph-field-is-required' : ''}`}
      aria-describedby={helpTextId}
      aria-invalid={hasError}
    >
      <legend
        className="oph-legend"
      >
        {legend}
      </legend>

      {children}

      {
        helpText
          ? <div id={helpTextId} className={`oph-field-text ${hasError ? 'oph-error' : ''}`}>
            {helpText}
          </div>
          : null
      }
    </fieldset>
  )
}

Fieldset.propTypes = propTypes
Fieldset.defaultProps = defaultProps

export default Fieldset
