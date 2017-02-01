import React, { PropTypes } from 'react'

const types = ['info', 'success', 'warning', 'error', 'help']
const positions = ['top', 'right', 'bottom', 'left']

const propTypes = {
  parent: PropTypes.string.isRequired,
  type: PropTypes.oneOf(types),
  position: PropTypes.oneOf(positions).isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string
}

const defaultProps = {
  type: null,
  text: null
}

class Popup extends React.Component {
  constructor (props) {
    super(props)

    this.handleOnClick = this.handleOnClick.bind(this)
    this.handleResize = this.handleResize.bind(this)
  }

  componentWillMount () {
    document.addEventListener('click', this.handleOnClick, false)
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleOnClick, false)
    window.removeEventListener('resize', this.handleResize)
  }

  getParentPosition () {
    if (document.querySelector(this.props.parent)) {
      const position = document.querySelector(this.props.parent).getBoundingClientRect()

      return position
    } else {
      return {
        top: 0,
        left: 0
      }
    }
  }

  handleOnClick (event) {
    // Check if click is outside the component
    if (!this.popup.contains(event.target)) {
      console.log('outside')
    }
  }

  handleResize (event) {
    this.forceUpdate()
  }

  render () {
    const {
      type,
      position,
      title,
      text
    } = this.props

    return (
      <div
        ref={popup => (this.popup = popup)}
        className={`popup ${type ? `popup-${type}` : ''} popup-${position}`}
        style={{ left: `${this.getParentPosition().left}px` }}
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
