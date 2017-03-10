import React, { PropTypes } from 'react'
import R from 'ramda'
import { Dropdown } from 'semantic-ui-react'

import UserGroupButton from './UserGroupButton'
import Field from '../common/form/Field'
import Fieldset from '../common/form/Fieldset'
import Checkbox from '../common/form/Checkbox'
import CheckboxButtonGroup from '../common/form/CheckboxButtonGroup'
import { translate } from '../common/Translations'

import mapDropdownOptions from '../utils/mapDropdownOptions'

const propTypes = {
  controller: PropTypes.object.isRequired,
  userGroups: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  release: PropTypes.object.isRequired
}

function Targeting (props) {
  const {
    controller,
    userGroups,
    categories,
    tags,
    release
  } = props

  const notification = release.notification

  const handleCategoryChange = event => {
    // Change checkbox value to int for consistency
    const value = parseInt(event.target.value, 10)

    controller.toggleCategory(value)
  }

  const handleUserGroupsChange = (event, { value }) => {
    controller.toggleUserGroup(value)
  }

  const handleSendEmailCheckboxChange = () => {
    console.log(release.sendEmail)

    controller.toggleSendEmail(!release.sendEmail)
  }

  const itemHasCategory = (item, selectedCategories) => {
    // "Target all user groups" item has id -1, display it always
    return item.id === -1
      ? true
      : R.length(R.intersection(item.categories, selectedCategories))
  }

  const isCategoryChecked = (id, categories) => {
    return R.contains(id, categories)
  }

  // Returns a translation key representing if user has selected categories
  const getUserGroupsString = hasSelectedCategories => {
    return hasSelectedCategories
      ? 'valittujenkategorioidenryhmat'
      : 'kaikkikayttooikeusryhmat'
  }

  // Prepend 'Target all user groups' item to user groups
  const allUserGroupsItem = {
    id: -1,
    name: translate('kohdennakaikilleryhmille')
  }

  const userGroupsWithAllItem = R.prepend(allUserGroupsItem, userGroups)

  // Returns all user groups or those linked to selected categories
  const getFilteredUserGroups = (userGroups, selectedCategories) => {
    return selectedCategories.length
      ? R.filter(userGroup => itemHasCategory(userGroup, selectedCategories), userGroups)
      : userGroups
  }

  const unselectedUserGroups = release.userGroups
    ? R.reject(
      userGroup => R.contains(userGroup.id, release.userGroups),
      getFilteredUserGroups(userGroupsWithAllItem, release.categories)
    )
    : []

  const getUserGroupName = (id, groups) => {
    return R.find(R.propEq('id', id))(groups).name
  }

  const areTagsDisabled = (tags, selectedCategories) => {
    return selectedCategories.length
      ? !itemHasCategory(tags, release.categories)
      : false
  }

  return (
    <div>
      <h2 className="hide">{translate('julkkategoriaryhma')}</h2>

      <div className="flex flex-wrap mb3 px3">
        {/*Categories*/}
        <div className="col-12 lg-col-3 sm-pr2">
          <Fieldset legend={translate('julkkategoria')}>
            {categories.map(category =>
              <div key={`releaseCategory${category.id}`} className="mb1">
                <Checkbox
                  label={category.name}
                  checked={isCategoryChecked(category.id, release.categories)}
                  value={category.id}
                  onChange={handleCategoryChange}
                />
              </div>
            )}
          </Fieldset>
        </div>

        {/*User groups*/}
        <div className="col-12 lg-col-4 lg-px2">
          <Field
            name="release-usergroups-search"
            label={translate(getUserGroupsString(release.categories.length))}
            isRequired
          >
            <Dropdown
              className="semantic-ui"
              fluid
              multiple
              name="release-usergroups"
              noResultsMessage={translate('eiryhma')}
              onChange={handleUserGroupsChange}
              options={mapDropdownOptions(unselectedUserGroups)}
              placeholder={translate('lisaaryhma')}
              search
              selection
              value={[]}
            />
          </Field>
        </div>

        <div className="col-12 lg-col-4 lg-pl2">
          <div className="invisible xs-hide sm-hide md-hide mb1">{translate('valitutryhmat')}</div>

          {
            release.userGroups
              ? release.userGroups.map(group =>
                <UserGroupButton
                  key={`userGroup${group}`}
                  id={group}
                  text={getUserGroupName(group, userGroupsWithAllItem)}
                  onClick={controller.toggleUserGroup}
                />
              )
              : null
          }
        </div>
      </div>

      {
        notification.validationState === 'empty'
          ? null
          : <div className="p3 border-top border-gray-lighten-3">
            <div className="mb2">{translate('tiedotteenavainsanat')} *</div>

            {tags.map(tags =>
              <Fieldset key={`notificationTagGroup${tags.id}`} legend={tags.name}>
                <CheckboxButtonGroup
                  groupId={tags.id}
                  htmlId="notification-tags"
                  options={tags.items}
                  selectedOptions={notification.tags}
                  disabled={areTagsDisabled(tags, release.categories)}
                  onChange={controller.toggleTag}
                />
              </Fieldset>
            )}
          </div>
      }

      <div className="pt3 px3 border-top border-gray-lighten-3">
        <div className="flex items-center justify-center col-12">
          {/*Targeting selection name*/}
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

        {
          notification.validationState === 'empty'
            ? null
            : <div className="flex justify-center col-12 mt2">
              <Checkbox
                label={translate('lahetasahkoposti')}
                checked={release.sendEmail}
                onChange={handleSendEmailCheckboxChange}
                value="sendEmail"
              />
            </div>
        }
      </div>
    </div>
  )
}

Targeting.propTypes = propTypes

export default Targeting
