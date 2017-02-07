import React, { PropTypes } from 'react'
import { Dropdown } from 'semantic-ui-react'

import { translate } from '../common/Translations'

import mapDropdownOptions from '../utils/mapDropdownOptions'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  selectedOptions: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired
}

function NotificationTagSelect (props) {
  const {
    controller,
    locale,
    options,
    selectedOptions,
    isLoading
  } = props

  const handleOnChange = (event, { value }) => {
    controller.setSelectedNotificationTags(value)
  }

  const handleOnLabelClick = (event, { value }) => {
    controller.toggleNotificationTag(value)
  }

  return (
    <div>
      <label className="hide" htmlFor="notification-tags-search">Hae tunnisteita</label>
      <Dropdown
        className="semantic-ui notification-tag-select"
        name="notifications-tags"
        fluid
        multiple
        noResultsMessage={translate('eitunnisteita')}
        onChange={handleOnChange}
        onLabelClick={handleOnLabelClick}
        options={mapDropdownOptions(options, locale)}
        placeholder={isLoading ? translate('haetaantunnisteita') : translate('hakusana')}
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
