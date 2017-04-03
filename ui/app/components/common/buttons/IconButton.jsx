import React, { PropTypes } from 'react'

// Components
import Button from './Button'
import Icon from '../Icon'
import { translate } from '../Translations'

const propTypes = {
  id: PropTypes.string,
  title: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}

const defaultProps = {
  id: '',
  isActive: false,
  disabled: false
}

function IconButton (props) {
  const {
    id,
    title,
    disabled,
    isActive,
    icon,
    onClick
  } = props

  return (
    <Button
      id={id}
      variants={['icon']}
      activeClass={isActive ? 'oph-button-icon-is-active' : ''}
      title={translate(title)}
      aria-label={translate(title)}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={icon} />
    </Button>
  )
}

IconButton.propTypes = propTypes
IconButton.defaultProps = defaultProps

export default IconButton
