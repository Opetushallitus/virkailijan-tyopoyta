import React, { PropTypes } from 'react'

const propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  labelIsHidden: PropTypes.bool,
  hasError: PropTypes.bool,
  helpTextId: PropTypes.string,
  helpText: PropTypes.string,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  isRequired: false,
  labelIsHidden: false,
  hasError: false,
  helpTextId: '',
  helpText: null
}

function Field (props) {
  const {
    name,
    label,
    labelIsHidden,
    isRequired,
    hasError,
    helpTextId,
    helpText,
    children
  } = props

  return (
    <div
      className={`oph-field ${isRequired ? 'oph-field-is-required' : ''}`}
      aria-required={isRequired}
      data-selenium-id={name}
    >
      <label
        className={`oph-label ${labelIsHidden ? 'display-none' : ''}`}
        htmlFor={name}
        aria-describedby={helpTextId}
        aria-invalid={hasError}
      >
        {label}
      </label>

      {children}

      {
        helpText
          ? <div id={helpTextId} className={`oph-field-text ${hasError ? 'oph-error' : ''}`}>
            {helpText}
          </div>
          : null
      }
    </div>
  )
}

Field.propTypes = propTypes
Field.defaultProps = defaultProps

export default Field
