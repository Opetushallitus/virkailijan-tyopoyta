import React, { PropTypes } from 'react'

const propTypes = {
  prop: PropTypes.String.isRequired
}

const defaultProps = {
}

class Component extends React.Component {
  render () {
    const {
      prop
    } = this.props

    return (
      <div prop={prop} />
    )
  }
}

Component.propTypes = propTypes
Component.defaultProps = defaultProps

export default Component
