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

  return (
    <div className="menu-container flex items-stretch">
      {/*Skeleton screen*/}
      <div
        className={`col-12 border-bottom border-gray-lighten-2 ${notificationsLoaded ? '' : 'display-none'}`}
      />

      <section
        className={`flex items-center col-12 border-bottom border-gray-lighten-2
        ${notificationsLoaded ? 'display-none' : ''}`}
      >
        <MobileMenu
          controller={controller}
          isMobileMenuVisible={isMobileMenuVisible}
        />
        {/*Actions*/}
        <div className="flex items-center xs-hide sm-hide">
          {/*Create a new release*/}
          <Button
            className="button-link h3 bold px0 mr3 py1"
            onClick={controller.editor.toggle}
          >
            +&nbsp;
            {translate('lisaauusi')}
          </Button>

          {/*Display unpublished notifications*/}
          <Button
            className="button-link regular right-align px0 py1"
            onClick={controller.unpublishedNotifications.toggle}
          >
            {translate('julktiedotteet')}
          </Button>
        </div>
      </section>
    </div>
  )
}

Menu.propTypes = propTypes

export default Menu
