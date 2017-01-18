import React, { PropTypes } from 'react'

import Icon from '../Icon'

const propTypes = {
  id: PropTypes.number.isRequired,
  htmlId: PropTypes.string.isRequired,
  variant: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired
}

const defaultProps = {
  checked: false,
  variant: 'regular'
}

const classList = [
  'checkbox-button-text',
  'inline-block',
  'mb1',
  'mr1',
  'lg-mb0',
  'border',
  'border-widen-1',
  'border-primary',
  'rounded',
  'bg-white',
  'primary'
]

function CheckboxButton (props) {
  const {
    id,
    htmlId,
    variant,
    label,
    checked,
    onChange
  } = props

  const handleOnChange = () => {
    onChange(id)
  }

  return (
    <label
      className="checkbox-button"
      htmlFor={`${htmlId}.${id}`}
    >
      <input
        id={`${htmlId}.${id}`}
        className="hide"
        type="checkbox"
        checked={checked}
        onChange={handleOnChange}
      />

      <span className={`${classList.join(' ')} ${variant === 'small' ? 'px1' : 'p1'}`}>
        <Icon className="mr1" name={`${checked ? 'check-' : ''}square-o`} />

        {label}
      </span>
    </label>
  )
}

CheckboxButton.propTypes = propTypes
CheckboxButton.defaultProps = defaultProps

export default CheckboxButton
