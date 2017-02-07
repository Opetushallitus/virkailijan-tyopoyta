import React, { PropTypes } from 'react'

// Components
import MobileMenu from './MobileMenu'
import CheckboxButtonGroup from '../common/form/CheckboxButtonGroup'
import Button from '../common/buttons/Button'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
  view: PropTypes.object.isRequired,
  unpublishedNotifications: PropTypes.array.isRequired,
  isMobileMenuVisible: PropTypes.bool.isRequired
}

function Menu (props) {
  const {
    controller,
    locale,
    categories,
    view,
    unpublishedNotifications,
    isMobileMenuVisible
  } = props

  const hasUnpublishedNotifications = unpublishedNotifications.length

  return (
    <div>
      {/*Skeleton screen*/}
      <div
        className={`col-12 py3 border-bottom border-gray-lighten-2 ${view.isInitialLoad ? '' : 'display-none'}`}
      />

      <section
        className={`relative flex flex-wrap items-center
        col-12 md-py2 border-bottom border-gray-lighten-2 ${view.isInitialLoad ? 'display-none' : ''}`}
      >
        <MobileMenu
          controller={controller}
          unpublishedNotifications={unpublishedNotifications}
          isMobileMenuVisible={isMobileMenuVisible}
        />

        {/*Filter view*/}
        <div
          className={`menu center md-left-align col-12 md-col-9 ${isMobileMenuVisible ? 'menu-is-visible' : ''}`}
        >
          {/*Categories*/}
          <div className="inline-block lg-inline md-col-1 mb1 lg-mb0">{translate('nayta')}</div>

          <fieldset className="md-inline-block lg-ml2">
            <legend className="hide">{translate('kategoriat')}</legend>

            <CheckboxButtonGroup
              locale={locale}
              htmlId="view-category"
              options={categories}
              selectedOptions={view.categories}
              onChange={controller.toggleViewCategory}
            />
          </fieldset>

          <span className="muted">Näkymän rajaus ei ole vielä toiminnassa</span>
        </div>

        {/*Actions*/}
        <div className="right-align flex-auto xs-hide sm-hide">
          {/*Create a new release*/}
          <Button
            className="button-link h3 bold px0 py1"
            onClick={controller.toggleEditor}
          >
            +&nbsp;
            {translate('lisaauusi')}
          </Button>

          <br />

          {/*Display unpublished notifications*/}
          {
            hasUnpublishedNotifications
              ? <Button
                className="button-link regular right-align px0 py1"
                onClick={controller.toggleUnpublishedNotifications}
              >
                {translate('julktiedotteet')}
              </Button>
              : null
          }
        </div>
      </section>
    </div>
  )
}

Menu.propTypes = propTypes

export default Menu
