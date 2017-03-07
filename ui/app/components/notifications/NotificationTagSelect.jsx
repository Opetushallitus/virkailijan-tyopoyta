import React, { PropTypes } from 'react'
import { Dropdown } from 'semantic-ui-react'
import R from 'ramda'

import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  selectedOptions: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isInitialLoad: PropTypes.bool.isRequired
}

function NotificationTagSelect (props) {
  const {
    controller,
    locale,
    options,
    selectedOptions,
    isLoading,
    isInitialLoad
  } = props

  const handleChange = (event, { value }) => {
    controller.setSelectedTags(value)
  }

  const handleLabelClick = (event, { value }) => {
    controller.toggleTag(value)
  }

  /*
    Dropdown component takes options as an array of objects:
    [
      {
        value: [option's value],
        text: [displayed text],
        description: [displayed description]
      },
      ...
    ]

    Returns options sorted by text
  */
  const mappedOptions = (options, locale) => {
    const name = `name_${locale}`

    const mappedOptions = R.flatten(
      R.map(option => R.map(item =>
        R.compose(
          R.omit(['id', name]),
          R.assoc('value', item.id),
          R.assoc('text', item[name]),
          R.assoc('description', option[name])
        )(item), option.items),
      options)
    )

    return R.sortBy(R.prop('text'))(mappedOptions)
  }

  return (
    <div>
      <label className="hide" htmlFor="notification-tag-select-search">{translate('suodatatiedotteita')}</label>

      <Dropdown
        className="notification-tag-select semantic-ui"
        name="notification-tag-select"
        fluid
        multiple
        noResultsMessage={translate('eitunnisteita')}
        onChange={handleChange}
        onLabelClick={handleLabelClick}
        options={isInitialLoad ? [] : mappedOptions(options, locale)}
        placeholder={isLoading || isInitialLoad ? translate('haetaantunnisteita') : translate('hakusana')}
        search
        selection
        scrolling
        value={selectedOptions}
      />
    </div>
  )
}

NotificationTagSelect.propTypes = propTypes

export default NotificationTagSelect
