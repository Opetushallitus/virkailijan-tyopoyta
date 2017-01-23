import React, { PropTypes } from 'react'

// Components
import Button from '../common/buttons/Button'
import Icon from '../common/Icon'
import Translation from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  unpublishedNotifications: PropTypes.object.isRequired,
  isMobileMenuVisible: PropTypes.bool.isRequired
}

function MobileMenu (props) {
  const {
    controller,
    unpublishedNotifications,
    isMobileMenuVisible
  } = props

  const hasUnpublishedNotifications = unpublishedNotifications.data.length

  return (
    <div className="md-hide lg-hide flex flex-wrap justify-center col-12">
      <Button
        className={`button-link col-6 sm-col-4 ${isMobileMenuVisible ? 'primary' : 'gray'}`}
        onClick={controller.toggleMenu}
      >
        <Icon className="mr1" name="sliders" />
        <Translation trans="rajaa" />
      </Button>

      <Button
        className="button-link col-6 sm-col-4 gray"
        onClick={controller.toggleEditor}
      >
        <Icon className="mr1" name="plus" />
        <Translation trans="uusisisalto" />
      </Button>

      {
        hasUnpublishedNotifications
          ? <Button
            className="button-link col-12 sm-col-4 gray"
            onClick={controller.toggleUnpublishedNotifications}
          >
            <Icon className="mr1" name="files-o" />
            <Translation trans="julktiedotteet" />
          </Button>
          : null
      }
    </div>
  )
}

MobileMenu.propTypes = propTypes

export default MobileMenu
