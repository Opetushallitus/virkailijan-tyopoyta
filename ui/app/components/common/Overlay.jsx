import React, { PropTypes } from 'react'
import getVariantsString from '../utils/getVariantsString'

const propTypes = {
  variants: PropTypes.array,
  children: PropTypes.node.isRequired
}

const defaultProps = {
  variants: []
}

class Overlay extends React.Component {
  componentDidMount () {
    // Animate the overlay
    this.overlay.classList.add('oph-overlay-bg')
  }

  render () {
    const {
      variants,
      children
    } = this.props

    return (
      <div className={`oph-overlay oph-overlay-is-visible ${getVariantsString('overlay', variants)}`}>
        {children}
      </div>
    )
  }
}

Overlay.propTypes = propTypes
Overlay.defaultProps = defaultProps

export default Overlay
