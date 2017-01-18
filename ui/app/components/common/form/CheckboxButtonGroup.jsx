import React, { PropTypes } from 'react'

import CheckboxButton from './CheckboxButton'

const propTypes = {
  locale: PropTypes.string.isRequired,
  htmlId: PropTypes.string.isRequired,
  variant: PropTypes.string,
  options: PropTypes.array.isRequired,
  selectedOptions: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
}

const defaultProps = {
  checked: false,
  variant: 'regular'
}

const isChecked = (selectedOptions, id) => {
  return selectedOptions.indexOf(id) >= 0
}

function CheckboxButtonGroup (props) {
  const {
    locale,
    htmlId,
    variant,
    options,
    selectedOptions,
    onChange
  } = props

  return (
    <div>
      {
        options.map((option, index) =>
          <CheckboxButton
            key={option.id}
            id={option.id}
            htmlId={htmlId}
            variant={variant}
            label={option[`name_${locale}`]}
            checked={isChecked(selectedOptions, option.id)}
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
