import React, { PropTypes } from 'react'

import Button from './buttons/Button'
import Icon from './Icon'

const propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

class Collapse extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isVisible: false
    }

    this.handleToggleButtonClick = this.handleToggleButtonClick.bind(this)
  }

  handleToggleButtonClick () {
    this.setState({
      isVisible: !this.state.isVisible
    })
  }

  render () {
    const {
      title,
      children
    } = this.props

    return (
      <div className={this.state.isVisible ? 'mb3' : 'mb2'}>
        <Button className="button-link regular px0" onClick={this.handleToggleButtonClick}>
          {title}

          <div className="inline-block ml1">
            <Icon name={this.state.isVisible ? 'chevron-up' : 'chevron-down'} />
          </div>
        </Button>

        <div
          className={this.state.isVisible
            ? 'border-top border-bottom border-gray-lighten-2 p2'
            : 'display-none'}
        >
          {children}
        </div>
      </div>
    )
  }
}

Collapse.propTypes = propTypes

export default Collapse
