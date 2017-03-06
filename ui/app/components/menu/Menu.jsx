import React, { PropTypes } from 'react'

// Components
import MobileMenu from './MobileMenu'
import Button from '../common/buttons/Button'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  notificationsLoaded: PropTypes.bool.isRequired,
  isMobileMenuVisible: PropTypes.bool.isRequired
}

function Menu (props) {
  const {
    controller,
    notificationsLoaded,
    isMobileMenuVisible
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
    <div className="menu-container flex items-stretch">
      {/*Placeholder to display on initial load*/}
      <div
        className={`col-12 border-bottom border-gray-lighten-2 ${notificationsLoaded ? '' : 'display-none'}`}
      />

      <section
        className={`flex col-12 border-bottom border-gray-lighten-2
        ${notificationsLoaded ? 'display-none' : ''}`}
      >
        <MobileMenu
          controller={controller}
          isMobileMenuVisible={isMobileMenuVisible}
        />
        {/*Actions*/}
        <div className="flex items-center col-12 xs-hide sm-hide">
          <div className="flex flex-auto items-center justify-end">
            {/*Create a new release*/}
            <Button
              id="button-open-editor"
              className="button-link h3 bold px0 mr3 py1"
              onClick={handleOpenEditorButtonClick}
            >
              +&nbsp;
              {translate('lisaauusi')}
            </Button>

            {/*Display unpublished notifications*/}
            <Button
              id="button-open-unpublished-notifications"
              className="button-link regular right-align px0 py1"
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

Menu.propTypes = propTypes

export default Menu
