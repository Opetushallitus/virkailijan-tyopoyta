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

  const mappedOptions = (options, locale) => {
    return R.flatten(
      R.map(option => R.map(item =>
        R.compose(
          R.omit(['id', `name_${locale}`]),
          R.assoc('value', item.id),
          R.assoc('text', item[`name_${locale}`]),
          R.assoc('description', option[`name_${locale}`])
        )(item), option.items),
      options)
    )
  }

  return (
    <div>
      <label className="hide" htmlFor="notification-tags-search">Hae tunnisteita</label>

      <Dropdown
        className="semantic-ui"
        name="notifications-tags"
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
