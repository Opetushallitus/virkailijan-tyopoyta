import React, { PropTypes } from 'react'
import R from 'ramda'
import { Dropdown } from 'semantic-ui-react'

import UserGroupButton from './UserGroupButton'
import Button from '../common/buttons/Button'
import Field from '../common/form/Field'
import Fieldset from '../common/form/Fieldset'
import CheckboxButtonGroup from '../common/form/CheckboxButtonGroup'
import Icon from '../common/Icon'
import { translate } from '../common/Translations'

import mapDropdownOptions from '../utils/mapDropdownOptions'

const propTypes = {
  locale: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  categories: PropTypes.array,
  userGroups: PropTypes.array.isRequired,
  release: PropTypes.object.isRequired
}

const defaultProps = {
  categories: []
}

function Targeting (props) {
  const {
    locale,
    controller,
    categories,
    userGroups,
    release
  } = props

  const handleOnUserGroupsChange = (event, { value }) => {
    controller.toggleReleaseUserGroup(value)
  }

  const handleOnFocusedCategoryChange = (event, { value }) => {
    controller.updateFocusedReleaseCategory(value)
  }

  const handleOnFocusedUserGroupsChange = (event, { value }) => {
    controller.toggleFocusedReleaseUserGroup(value)
  }

  /* Get unselected user groups for Dropdown options */
  const getUnselectedUserGroups = (groups, selectedGroups) => {
    return R.reject(
      group => R.contains(group.id, selectedGroups),
      groups
    )
  }

  const unselectedUserGroups = release.userGroups
    ? getUnselectedUserGroups(userGroups, release.userGroups)
    : userGroups

  const unselectedFocusedUserGroups = release.focusedUserGroups
    ? getUnselectedUserGroups(userGroups, release.focusedUserGroups)
    : userGroups

  const getUserGroupName = (id, groups, locale) => {
    return R.find(R.propEq('id', id))(groups)[`name_${locale}`]
  }

  // Add a 'No category' option for clearing the focused category dropdown
  const focusedCategoryOptions = [{ value: null, text: translate('eikategoriaa') }]
    .concat(mapDropdownOptions(categories, locale))

  const selectedCategories = release.categories || []

  return (
    <div>
      <h2 className="hide">{translate('julkkategoriaryhma')}</h2>

      <div className="flex flex-wrap mb3">
        {/*Categories*/}
        <div className="col-12 sm-pr2">
          <Fieldset isRequired legend={translate('julkkategoria')}>
            <CheckboxButtonGroup
              locale={locale}
              htmlId="release-category"
              options={categories}
              selectedOptions={selectedCategories}
              onChange={controller.toggleReleaseCategory}
            />
          </Fieldset>
        </div>

        {/*User groups*/}
        <div className="col-12 sm-col-6 sm-pr2">
          <Field name="release-usergroups-search" label={translate('julkryhma')}>
            <Dropdown
              className="semantic-ui"
              fluid
              multiple
              name="release-usergroups"
              noResultsMessage={translate('eiryhma')}
              onChange={handleOnUserGroupsChange}
              options={mapDropdownOptions(unselectedUserGroups, locale)}
              placeholder={translate('lisaaryhma')}
              search
              selection
              value={[]}
            />
          </Field>
        </div>

        <div className="col-12 sm-col-6 sm-pl2">
          <div className="invisible xs-hide sm-hide mb1">{translate('valitutryhmat')}</div>

          {
            release.userGroups
              ? release.userGroups.map(group =>
                <UserGroupButton
                  key={`userGroup${group}`}
                  id={group}
                  text={getUserGroupName(group, userGroups, locale)}
                  onClick={controller.toggleReleaseUserGroup}
                />
              )
              : null
          }
        </div>

        {/*Focus targeting*/}
        <div className="col-12 mt3 bg-gray-lighten-5">
          <Button className="button-link left-align col-12">
            <div className="inline-block mr1">{translate('kohdennatarkemmin')}</div>
            <Icon name="chevron-down" />
          </Button>

          <div className="flex flex-wrap col-12 mb2 px2">
            <div className="col-12 sm-col-6 mb3">
              <div className="radio-button-group">
                <label
                  className="radio-button"
                  htmlFor="focus-category"
                >
                  <input
                    id="focus-category"
                    className="radio-button-input"
                    name="focus-targeting"
                    type="radio"
                  />

                  <span className="radio-button-text">Kohdenna kategoriaan</span>
                </label>

                <label
                  className="radio-button"
                  htmlFor="focus-user-group"
                >
                  <input
                    id="focus-user-group"
                    className="radio-button-input"
                    name="focus-targeting"
                    type="radio"
                  />

                  <span className="radio-button-text">Kohdenna käyttöoikeusryhmään</span>
                </label>
              </div>
            </div>

            {/*Category*/}
            <div className="col-12">
              <div className="md-col-6 md-pr2">
                <Field name="release-focused-category-search" label={translate('valitsekategoria')}>
                  <Dropdown
                    className="semantic-ui"
                    fluid
                    name="release-focused-category"
                    noResultsMessage={translate('eikategorioita')}
                    onChange={handleOnFocusedCategoryChange}
                    options={focusedCategoryOptions}
                    placeholder={translate('haekategoria')}
                    search
                    selection
                    value={release.focusedCategory || ''}
                  />
                </Field>
              </div>
            </div>

            {/*Category user groups*/}
            <div className="col-12">
              <div className="md-col-6 sm-pr2">
                <Field name="release-focused-category-usergroups-search" label={translate('valitsekayttooikeusryhmat')}>
                  <Dropdown
                    className="semantic-ui"
                    disabled
                    fluid
                    multiple
                    name="release-focused-category-usergroups"
                    noResultsMessage={translate('eiryhma')}
                    options={[]}
                    placeholder={translate('lisaaryhma')}
                    search
                    selection
                    value={[]}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/*User groups*/}
          <div className="flex flex-wrap col-12 mb2 px2">
            <div className="col-12 sm-col-6 sm-pr2">
              <Field name="release-focused-usergroups-search" label={translate('valitsekayttooikeusryhmat')}>
                <Dropdown
                  className="semantic-ui"
                  fluid
                  multiple
                  name="release-focused-usergroups"
                  noResultsMessage={translate('eiryhma')}
                  onChange={handleOnFocusedUserGroupsChange}
                  options={mapDropdownOptions(unselectedFocusedUserGroups, locale)}
                  placeholder={translate('lisaaryhma')}
                  search
                  selection
                  value={[]}
                />
              </Field>
            </div>

            <div className="col-12 sm-col-6 sm-pl2">
              <div className="invisible xs-hide sm-hide mb1">{translate('valitutryhmat')}</div>

              {
                release.focusedUserGroups
                  ? release.focusedUserGroups.map(group =>
                    <UserGroupButton
                      key={`focusedUsergroup${group}`}
                      id={group}
                      text={getUserGroupName(group, userGroups, locale)}
                      onClick={controller.toggleFocusedReleaseUserGroup}
                    />
                  )
                  : null
              }
            </div>
          </div>
        </div>
      </div>

      {/*Targeting selection name*/}
      <div className="center">
        <label
          className="block md-inline-block mb1 md-mb0 mr2"
          htmlFor="targeting-name"
        >
          {translate('kohderyhmavalinnannimi')}
        </label>

        <input
          className="input md-col-6 lg-col-3"
          type="text"
          name="targeting-name"
        />
      </div>
    </div>
  )
}

Targeting.propTypes = propTypes
Targeting.defaultProps = defaultProps

export default Targeting
