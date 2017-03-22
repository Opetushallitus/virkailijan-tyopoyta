import React, { PropTypes } from 'react'

const debounce = require('lodash.debounce')
const types = ['info', 'success', 'warning', 'error', 'default']
const positions = ['top', 'right', 'bottom', 'left']

const propTypes = {
  target: PropTypes.string,
  type: PropTypes.oneOf(types).isRequired,
  position: PropTypes.oneOf(positions).isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  onOutsideClick: PropTypes.func
}

const defaultProps = {
  target: '',
  text: null,
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
      text
    } = this.props

    const node = target ? document.querySelector(target) : null
    const rectangle = target ? node.getBoundingClientRect() : null
    const top = target ? `${node.offsetTop}px` : 0
    const left = target ? `${node.offsetLeft + rectangle.width}px` : 0

    return (
      <div
        ref={popup => (this.popup = popup)}
        className={`popup ${type ? `popup-${type}` : ''} popup-${position}`}
        style={{
          top,
          left
        }}
        role="tooltip"
      >
        <div className="popup-title">{title}</div>

        {
          text
            ? <div className="popup-text">{text}</div>
            : null
        }
      </div>
    )
  }
}

Popup.propTypes = propTypes
Popup.defaultProps = defaultProps

export default Popup
