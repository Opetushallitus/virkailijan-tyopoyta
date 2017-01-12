import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import mapDropdownOptions from '../utils/mapDropdownOptions'
import Translation from '../Translations'

const handleOnChange = (controller, event, { value }) => {
  controller.setSelectedNotificationTags(value)
}

const handleOnLabelClick = (controller, event, { value }) => {
  controller.toggleNotificationTag(value)
}

function NotificationTagSelect (props) {
  const {
    controller,
    locale,
    options,
    selectedOptions
  } = props

  return (
    <div>
      <label className="hide" htmlFor="notification-tags-search">Hae tunnisteita</label>
      <Dropdown
        className="semantic-ui notification-tag-select"
        name="notifications-tags"
        fluid
        multiple
        noResultsMessage={<Translation trans="eitunnisteita"/>}
        onChange={handleOnChange.bind(null, controller)}
        onLabelClick={handleOnLabelClick.bind(null, controller)}
        options={mapDropdownOptions(options, locale)}
        placeholder={<Translation trans="hakusana"/>}
        search
        selection
        scrolling
        value={selectedOptions}
      />
    </div>
  )
}

export default NotificationTagSelect
