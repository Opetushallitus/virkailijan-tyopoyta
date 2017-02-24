import React, { PropTypes } from 'react'
import { Dropdown } from 'semantic-ui-react'

import { translate } from '../common/Translations'

import mapDropdownOptions from '../utils/mapDropdownOptions'

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
    controller.setSelectedItems(value)
  }

  const handleLabelClick = (event, { value }) => {
    controller.toggle(value)
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
        options={isInitialLoad ? [] : mapDropdownOptions(options, locale)}
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
