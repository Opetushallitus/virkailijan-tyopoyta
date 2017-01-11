import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import mapDropdownOptions from '../utils/mapDropdownOptions'

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
        noResultsMessage="Ei tunnisteita"
        onChange={handleOnChange.bind(null, controller)}
        onLabelClick={handleOnLabelClick.bind(null, controller)}
        options={mapDropdownOptions(options, locale)}
        placeholder="Hakusana"
        search
        selection
        scrolling
        value={selectedOptions}
      />
    </div>
  )
}

export default NotificationTagSelect
