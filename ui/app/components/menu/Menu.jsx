import React, { PropTypes } from 'react'

// Components
import MobileMenu from './MobileMenu'
import TimePeriod from './TimePeriod'
import CheckboxButtonGroup from '../common/form/CheckboxButtonGroup'
import Button from '../common/buttons/Button'
import Translation from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
  view: PropTypes.object.isRequired,
  unpublishedNotifications: PropTypes.object.isRequired,
  isMobileMenuVisible: PropTypes.bool.isRequired
}

function Menu (props) {
  const {
    controller,
    locale,
    dateFormat,
    categories,
    view,
    unpublishedNotifications,
    isMobileMenuVisible
  } = props

  const hasUnpublishedNotifications = unpublishedNotifications.data.length

  return (
    <section
      className="relative flex flex-wrap items-center col-12 md-py2 border-bottom border-gray-lighten-2"
    >
      <MobileMenu
        controller={controller}
        unpublishedNotifications={unpublishedNotifications}
        isMobileMenuVisible={isMobileMenuVisible}
      />

      {/*Filter view*/}
      <div
        className={`menu center md-left-align flex-auto mb2 md-mb0
        ${hasUnpublishedNotifications ? 'py2' : ''} ${isMobileMenuVisible ? 'menu-is-visible' : ''}`}
      >
        {/*Categories*/}
        <div className="mb1 lg-mb0 lg-inline-block display-none">
          <div className="inline-block lg-inline md-col-1 mb1 lg-mb0"><Translation trans="nayta" /></div>

          <fieldset className="md-inline-block lg-ml2">
            <legend className="hide"><Translation trans="kategoriat" /></legend>

            <CheckboxButtonGroup
              locale={locale}
              htmlId="view-category"
              options={categories}
              selectedOptions={view.categories}
              onChange={controller.toggleViewCategory}
            />
          </fieldset>
        </div>

        {/*Time period*/}
        <div className="md-inline-block col-12 lg-col-5 lg-ml2 display-none">
          <TimePeriod
            controller={controller}
            locale={locale}
            dateFormat={dateFormat}
            startDate={view.startDate}
            endDate={view.endDate}
          />
        </div>

        <span className="muted">Näkymän rajaus ei ole vielä toiminnassa</span>
      </div>

      {/*Actions*/}
      <div className="md-right-align absolute right-0 lg-col-2 xs-hide sm-hide">
        {/*Create a new release*/}
        <Button
          className="button-link h3 bold px0 py1"
          onClick={controller.toggleEditor}
        >
          +&nbsp;
          <Translation trans="lisaauusi" />
        </Button>

        <br />

        {/*Display unpublished notifications*/}
        {
          hasUnpublishedNotifications
            ? <Button
              className="button-display-unpublished-notifications button-link regular right-align px0 py1"
              onClick={controller.toggleUnpublishedNotifications}
            >
              <Translation trans="julktiedotteet" />
            </Button>
            : null
        }
      </div>
    </section>
  )
}

Menu.propTypes = propTypes

export default Menu
