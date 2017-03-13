import React, { PropTypes } from 'react'

// Components
import Button from '../common/buttons/Button'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired
}

function NotificationsMenu (props) {
  const {
    controller
  } = props

  const handleOpenEditorButtonClick = event => {
    // Send event target id to set focus back to button when closing the editor
    const id = event.target.getAttribute('id')

    controller.editor.open(`#${id}`)
  }

  const handleOpenUnpublishedNotificationsButtonClick = event => {
    // Send event target id to set focus back to button when closing the editor
    const id = event.target.getAttribute('id')

    controller.unpublishedNotifications.open(`#${id}`)
  }

  return (
    <div className="notifications-menu flex items-stretch">
      <section className="flex col-12 border-bottom border-gray-lighten-2">
        {/*Actions*/}
        <div className="flex items-center col-12">
          <div className="center md-flex flex-auto items-center justify-end">
            {/*Create a new release*/}
            <Button
              id="button-open-editor"
              className="button-link h3 bold px0 sm-mr3 sm-py1"
              onClick={handleOpenEditorButtonClick}
            >
              +&nbsp;
              {translate('lisaauusi')}
            </Button>

            <br className="sm-hide" />

            {/*Display unpublished notifications*/}
            <Button
              id="button-open-unpublished-notifications"
              className="button-link regular right-align px0 sm-py1"
              onClick={handleOpenUnpublishedNotificationsButtonClick}
            >
              {translate('julktiedotteet')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

NotificationsMenu.propTypes = propTypes

export default NotificationsMenu
