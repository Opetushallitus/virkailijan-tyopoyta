import React, { PropTypes } from 'react'

// Components
import MobileMenu from './MobileMenu'
import Button from '../common/buttons/Button'
import Translation from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  isMobileMenuVisible: PropTypes.bool.isRequired
}

function Menu (props) {
  const {
    controller,
    isMobileMenuVisible
  } = props

  return (
    <section
      className="relative flex flex-wrap items-center col-12 md-py2 border-bottom border-gray-lighten-2"
    >
      <MobileMenu
        controller={controller}
        isMobileMenuVisible={isMobileMenuVisible}
      />

      {/*Filter notification list*/}
      <div className={`menu center md-left-align flex-auto mb2 md-mb0 ${isMobileMenuVisible ? 'menu-is-visible' : ''}`}>
        {/*Categories*/}
        <div className="mb1 lg-mb0 lg-inline-block display-none">
          <div className="inline-block lg-inline md-col-1 mb1 lg-mb0"><Translation trans="nayta" /></div>

          <span className="hide"><Translation trans="kategoriat" /></span>

          <div className="md-inline-block lg-ml2" />
        </div>

        {/*Time period*/}
        <div className="md-inline-block col-12 lg-col-5 lg-ml2 display-none" />

        <span className="muted">Näkymän rajaus ei ole vielä toiminnassa</span>
      </div>

      {/*Actions*/}
      <div className="md-right-align absolute right-0 xs-hide sm-hide primary">
        {/*Create a new release*/}
        <Button
          className="button-link h3 bold px0"
          onClick={controller.toggleEditor}
        >
          +&nbsp;
          <Translation trans="lisaauusi" />
        </Button>

        <br />

        {/*Display unpublished notifications*/}
        <Button
          className="button-link px0 display-none"
        >
          <Translation trans="julktiedotteet" />
        </Button>
      </div>
    </section>
  )
}

Menu.propTypes = propTypes

export default Menu
