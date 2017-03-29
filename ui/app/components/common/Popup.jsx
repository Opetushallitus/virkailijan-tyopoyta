import React, { PropTypes } from 'react'

const debounce = require('lodash.debounce')
const types = ['info', 'success', 'warning', 'error', 'default']
const positions = ['top', 'right', 'bottom', 'left']

const propTypes = {
  target: PropTypes.string,
  type: PropTypes.oneOf(types).isRequired,
  position: PropTypes.oneOf(positions).isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  onOutsideClick: PropTypes.func
}

const defaultProps = {
  target: '',
  text: null,
  children: null,
  onOutsideClick: () => {}
}

class Popup extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.handleResize = debounce(this.handleResize.bind(this), 100)
  }

  componentDidMount () {
    document.addEventListener('click', this.handleClick, false)
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleClick, false)
    window.removeEventListener('resize', this.handleResize)
  }

  handleClick (event) {
    // Check if click is outside the component
    if (!this.popup.contains(event.target)) {
      this.props.onOutsideClick()
    }
  }

  handleResize (event) {
    this.forceUpdate()
  }

  render () {
    const {
      target,
      type,
      position,
      title,
      children
    } = this.props

    const node = target ? document.querySelector(target) : null
    const offset = target ? node.getBoundingClientRect() : null
    const top = target ? `${node.offsetTop}px` : 0
    const left = target ? `${node.offsetLeft + offset.width}px` : 0

    return (
      <div
        ref={popup => (this.popup = popup)}
        className={`oph-popup ${type ? `oph-popup-${type}` : ''} oph-popup-${position}`}
        style={{
          top,
          left
        }}
      >
        <div className="oph-popup-arrow" />

        <div className="oph-popup-title">{title}</div>

        {
          children
            ? <div className="oph-popup-content">{children}</div>
            : null
        }
      </div>
    )
  }
}

Popup.propTypes = propTypes
Popup.defaultProps = defaultProps

export default Popup
