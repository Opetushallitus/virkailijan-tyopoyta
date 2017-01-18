import React, { PropTypes } from 'react'

// Components
import Button from '../common/buttons/Button'
import Icon from '../common/Icon'
import Translation from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  isMobileMenuVisible: PropTypes.bool.isRequired
}

function MobileMenu (props) {
  const {
    controller,
    isMobileMenuVisible
  } = props

  return (
    <div className="md-hide lg-hide flex justify-center col-12">
      <Button
        className={`button-link h5 caps ${isMobileMenuVisible ? 'primary' : 'gray'}`}
        onClick={controller.toggleMenu}
      >
        <Icon className="mr1" name="sliders" />
        <Translation trans="rajaahakua" />
      </Button>

      <Button
        className="button-link h5 caps gray"
        onClick={controller.toggleEditor}
      >
        <Icon className="mr1" name="plus" />
        <Translation trans="lisaauusi" />
      </Button>

      <Button className="button-link h5 caps gray display-none">
        <Icon className="mr1" name="files-o" />
        <Translation trans="julktiedotteet" />
      </Button>
    </div>
  )
}

MobileMenu.propTypes = propTypes

export default MobileMenu
