import React, { PropTypes } from 'react'

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
      <div
        ref={overlay => (this.overlay = overlay)}
        className={`oph-overlay oph-overlay-is-visible
        ${variants.map(variant => { return `oph-overlay-${variant}` }).join(' ')}`}
      >
        {children}
      </div>
    )
  }
}

Overlay.propTypes = propTypes
Overlay.defaultProps = defaultProps

export default Overlay
