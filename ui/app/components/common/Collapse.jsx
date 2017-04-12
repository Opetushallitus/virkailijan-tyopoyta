import React, { PropTypes } from 'react'

import Button from './buttons/Button'
import Icon from './Icon'

const propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isVisible: PropTypes.bool
}

const defaultProps = {
  isVisible: false
}

class Collapse extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isVisible: props.isVisible
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
      id,
      title,
      children
    } = this.props

    return (
      <div className={this.state.isVisible ? 'mb3' : 'mb2'}>
        <Button
          variants={['ghost']}
          className="regular py2 px0"
          onClick={this.handleToggleButtonClick}
          aria-controls={id}
          aria-expanded={this.state.isVisible}
          data-selenium-id={`${id}-button`}
        >
          <span data-selenium-id={`${id}-title`}>{title}</span>

          <div className="inline-block ml1">
            <Icon name={this.state.isVisible ? 'chevron-up' : 'chevron-down'} />
          </div>
        </Button>

        <div
          id={`#${id}`}
          className={this.state.isVisible
            ? 'border-top border-bottom p2'
            : 'display-none'}
          data-selenium-id={id}
        >
          {children}
        </div>
      </div>
    )
  }
}

Collapse.propTypes = propTypes
Collapse.defaultProps = defaultProps

export default Collapse
