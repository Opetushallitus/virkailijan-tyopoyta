import React from 'react';

import Icon from '../Icon'

const isChecked = (selectedNotificationTags, value) => selectedNotificationTags.indexOf(value) >= 0

const toggleNotificationTag = (controller, value) => controller.toggleNotificationTag(value)

const renderQuickTag = (option, locale, selectedOptions, controller) => {
  const text = option[`name_${locale}`]

  return (
    <label
      key={option.id}
      className="checkbox-button"
    >
      <input
        className="hide"
        onChange={toggleNotificationTag.bind(null, controller, option.id)}
        type="checkbox"
        checked={isChecked(selectedOptions, option.id)}
        defaultValue={text}
      />

      <span className="checkbox-button-text button-small center mr1 mb1 md-mb0 px1 inline-block border border-widen-1 border-primary rounded bg-white primary">
        <Icon classList="mr1" name={`${isChecked(selectedOptions, option.id) ? 'check-' : ''}square-o`} />

        {text}
      </span>
    </label>
  )
}

function QuickTagSelect (props) {
  return (
    <div>
      <div className="mb1 md-mb0 md-mr2 md-inline-block">Pikavalinta</div>

      {props.options.map(option => {
        return renderQuickTag(option, props.locale, props.selectedOptions, props.controller)
      })}

      {/*<label>*/}
        {/*<input*/}
          {/*onChange={toggleNotificationTag.bind(null, props.controller, "expired")}*/}
          {/*type="checkbox"*/}
          {/*checked={isChecked(props.selectedOptions, "expired")}*/}
          {/*defaultValue="expired"*/}
        {/*/>*/}
        {/*Näytä poistuneet*/}
      {/*</label>*/}
    </div>
  )
}

export default QuickTagSelect;
