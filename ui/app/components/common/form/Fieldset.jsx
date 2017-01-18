import React, { PropTypes } from 'react'

const propTypes = {
  isRequired: PropTypes.bool,
  legend: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  isRequired: false
}

function Fieldset (props) {
  const {
    isRequired,
    legend,
    children
  } = props

  return (
    <fieldset className={`field ${isRequired ? 'field-is-required' : ''}`}>
      <legend
        className="legend"
      >
        {legend}
      </legend>

      {children}
    </fieldset>
  )
}

Fieldset.propTypes = propTypes
Fieldset.defaultProps = defaultProps

export default Fieldset
