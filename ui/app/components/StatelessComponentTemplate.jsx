import React, { PropTypes } from 'react'

const propTypes = {
  prop: PropTypes.String.isRequired
}

const defaultProps = {
}

function StatelessComponent (props) {
  const {
    prop
  } = props

  return (
    <div prop={prop} />
  )
}

StatelessComponent.propTypes = propTypes
StatelessComponent.defaultProps = defaultProps

export default StatelessComponent
