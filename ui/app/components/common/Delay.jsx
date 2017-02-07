import React, { PropTypes } from 'react'

const propTypes = {
  time: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired
}

class Delay extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isDone: false
    }
  }

  componentDidMount () {
    this.timer = setTimeout(() => {
      this.setState({
        isDone: true
      })
    }, this.props.time)
  }

  componentWillUnmount () {
    clearTimeout(this.timer)
  }

  render () {
    return this.state.isDone ? this.props.children : null
  }
}

Delay.propTypes = propTypes

export default Delay
