import React, { PropTypes } from 'react'

// Components
import MobileMenu from './MobileMenu'
import CategorySelect from './CategorySelect'
import Button from '../common/buttons/Button'
import { translate } from '../common/Translations'

const propTypes = {
  locale: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  selectedCategories: PropTypes.array.isRequired,
  notificationsLoaded: PropTypes.bool.isRequired,
  isMobileMenuVisible: PropTypes.bool.isRequired
}

function Menu (props) {
  const {
    locale,
    controller,
    categories,
    selectedCategories,
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
        className={`flex col-12 border-bottom border-gray-lighten-2
        ${notificationsLoaded ? 'display-none' : ''}`}
      >
        <MobileMenu
          controller={controller}
          isMobileMenuVisible={isMobileMenuVisible}
        />
        {/*Actions*/}
        <div className="flex items-center col-12 xs-hide sm-hide">
          {/*Filter view by category*/}
          <div className="col-12 md-col-3 display-none">
            <CategorySelect
              locale={locale}
              options={categories.items}
              selectedOptions={selectedCategories}
              controller={controller.view}
              isLoading={categories.isLoading}
              isInitialLoad={categories.isInitialLoad}
            />
          </div>

          <div className="flex flex-auto items-center justify-end">
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
        </div>
      </section>
    </div>
  )
}

Menu.propTypes = propTypes

export default Menu
