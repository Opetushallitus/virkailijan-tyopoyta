import React, { PropTypes } from 'react'

import CheckboxButtonGroup from '../common/form/CheckboxButtonGroup'
import Translation from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  selectedOptions: PropTypes.array.isRequired
}

function QuickTagSelect (props) {
  const {
    controller,
    locale,
    options,
    selectedOptions
  } = props

  return (
    <div>
      <div className="mb1 md-mb0 md-mr2 md-inline-block"><Translation trans="pikavalinta" /></div>

      <div className="md-inline-block">
        <CheckboxButtonGroup
          locale={locale}
          htmlId="notification-tag"
          variant="small"
          options={options}
          selectedOptions={selectedOptions}
          onChange={controller.toggle}
        />
      </div>
    </div>
  )
}

QuickTagSelect.propTypes = propTypes

export default QuickTagSelect
