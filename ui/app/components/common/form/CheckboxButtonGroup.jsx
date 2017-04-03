import React, { PropTypes } from 'react'
import R from 'ramda'

import CheckboxButton from './CheckboxButton'

const propTypes = {
  htmlId: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  selectedOptions: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired
}

const defaultProps = {
  disabled: false
}

const isChecked = (selectedOptions, id) => {
  return R.contains(id, selectedOptions)
}

function CheckboxButtonGroup (props) {
  const {
    htmlId,
    options,
    selectedOptions,
    disabled,
    onChange
  } = props

  return (
    <div>
      {
        options.map((option, index) =>
          <CheckboxButton
            key={htmlId + option.id}
            id={option.id}
            htmlId={htmlId}
            label={option.name}
            checked={isChecked(selectedOptions, option.id)}
            disabled={disabled}
            onChange={onChange}
          />
        )
      }
    </div>
  )
}

CheckboxButtonGroup.propTypes = propTypes
CheckboxButtonGroup.defaultProps = defaultProps

export default CheckboxButtonGroup
