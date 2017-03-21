import React, { PropTypes } from 'react'

// Components
import Field from './Field'
import { translate } from '../Translations'

const propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  maxLength: PropTypes.number.isRequired,
  isRequired: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func
}

const defaultProps = {
  value: '',
  isRequired: false,
  onBlur: null
}

function LimitedTextField (props) {
  const {
    label,
    name,
    value,
    maxLength,
    isRequired,
    onChange,
    onBlur
  } = props

  const handleChange = event => {
    onChange(event.target.value)
  }

  return (
    <Field
      label={label}
      name={name}
      isRequired={isRequired}
    >
      <div className="muted md-right mb1 md-mb0">
        {maxLength - value.length}&nbsp;{translate('merkkiajaljella')}
      </div>

      <input
        className="input"
        maxLength={maxLength}
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
      />
    </Field>
  )
}

LimitedTextField.propTypes = propTypes
LimitedTextField.defaultProps = defaultProps

export default LimitedTextField
