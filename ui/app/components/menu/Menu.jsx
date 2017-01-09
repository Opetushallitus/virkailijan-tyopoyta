import React from 'react'

// Components
import MobileMenu from './MobileMenu'
import TimePeriod from './TimePeriod'
import CategorySelect from '../CategorySelect'
import Button from '../Button'
import Icon from '../Icon'
import Translation from '../Translations';

function Menu (props) {
  const {
    controller,
    isVisible,
    hasUnpublishedReleases
  } = props

  return (
    <section
      className={
        `relative flex flex-wrap items-center col-12 md-py2 border-bottom
        border-gray-lighten-2 ${hasUnpublishedReleases ? 'lg-py3' : ''}`
      }
    >
      <MobileMenu
        controller={controller}
        hasUnpublishedReleases={hasUnpublishedReleases}
        isVisible={isVisible}
      />

      <div className={`menu center md-left-align flex-auto mb2 md-mb0 ${isVisible ? 'menu-is-visible' : ''}`}>
        {/*Categories*/}
        {/*<div className="mb1 lg-mb0 lg-inline-block">*/}
          {/*<div className="inline-block lg-inline md-col-1 mb1 lg-mb0">Näytä</div>*/}
          {/*<span className="hide">Kategoriat</span>*/}

          {/*<div className="md-inline-block lg-ml2">*/}
            {/*/!*<CategorySelect />*!/*/}
          {/*</div>*/}
        {/*</div>*/}

        {/*Time period*/}
        {/*<div className="md-inline-block col-12 lg-col-5 lg-ml2">*/}
          {/*<TimePeriod />*/}
        {/*</div>*/}
        <span className="muted">Näkymän rajaus ei ole vielä toiminnassa</span>
      </div>

      {/*Actions*/}
      <div className="md-right-align absolute right-0 xs-hide sm-hide primary">
        {/*Create a new release*/}
        <Button
          classList="button-link h3 bold px0"
          onClick={() => controller.toggleEditor(true)}
        >
          <Icon classList="mr0" name="plus" />
          <Translation trans="lisaauusi"/>
        </Button>

        <br />

        {/*List unpublished releases*/}
        {
          hasUnpublishedReleases
            ?
              <Button
                classList="button-link px0"
              >
                <Translation trans="julktiedotteet"/>
              </Button>
            : null
        }
      </div>
    </section>
  )
}

export default Menu
