import React, { PropTypes } from 'react'
import R from 'ramda'
import { Dropdown } from 'semantic-ui-react'

import TargetingGroupButton from './TargetingGroupButton'
import RemoveTargetingGroupButton from './RemoveTargetingGroupButton'
import UserGroupButton from './UserGroupButton'
import Field from '../../common/form/Field'
import Fieldset from '../../common/form/Fieldset'
import Checkbox from '../../common/form/Checkbox'
import CheckboxButtonGroup from '../../common/form/CheckboxButtonGroup'
import { translate } from '../../common/Translations'

import mapDropdownOptions from '../../utils/mapDropdownOptions'

const propTypes = {
  controller: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  userGroups: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  tagGroups: PropTypes.array.isRequired,
  targetingGroups: PropTypes.object.isRequired,
  release: PropTypes.object.isRequired
}

function Targeting (props) {
  const {
    controller,
    user,
    userGroups,
    categories,
    tagGroups,
    targetingGroups,
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
    controller.toggleSendEmail(!release.notification.sendEmail)
  }

  const handleTargetingGroupNameChange = event => {
    controller.update('targetingGroup', event.target.value)
  }

  const isCategoryChecked = (id, categories) => {
    return R.contains(id, categories)
  }

  // Check if selected item (user group or tag) is linked to a selected category
  const itemHasCategory = (item, selectedCategories) => {
    // "Target all user groups" item has id -1, always display it
    return item.id === -1
      ? true
      : R.length(R.intersection(item.categories, selectedCategories))
  }

  // Returns a translation key representing whether user has selected categories
  const getUserGroupsKey = hasSelectedCategories => {
    return hasSelectedCategories
      ? 'valittujenkategorioidenryhmat'
      : 'kaikkikayttooikeusryhmat'
  }

  // Prepend 'Target all user groups' item to user groups
  const allUserGroupsItem = {
    id: -1,
    description: {
      FI: translate('kohdennakaikilleryhmille'),
      SV: translate('kohdennakaikilleryhmille'),
      EN: translate('kohdennakaikilleryhmille')
    }
  }

  const userGroupsWithAllItem = R.prepend(allUserGroupsItem, userGroups)

  // Returns all user groups or those linked to selected categories
  const getFilteredUserGroups = (userGroups, selectedCategories) => {
    return selectedCategories.length
      ? R.filter(userGroup => itemHasCategory(userGroup, selectedCategories), userGroups)
      : userGroups
  }

  const getUserGroupDescription = (id, groups) => {
    return R.find(R.propEq('id', id))(groups).description[user.lang.toUpperCase()]
  }

  const unselectedUserGroups = release.userGroups
    ? R.reject(
      userGroup => R.contains(userGroup.id, release.userGroups),
      getFilteredUserGroups(userGroupsWithAllItem, release.categories)
    )
    : []

  /*
    Tag group is disabled if at least one category is selected and it isn't linked to any of the selected
    categories
  */
  const isTagGroupDisabled = (tagGroup, selectedCategories) => {
    return selectedCategories.length
      ? !itemHasCategory(tagGroup, release.categories)
      : false
  }

  return (
    <div>
      <h2 className="hide">{translate('kohdennus')}</h2>

      <div className="flex flex-wrap mb3 px3">
        {/*Saved targeting groups*/}
        {
          targetingGroups.items.length > 0
            ? <div className="flex flex-wrap col-12 mb3">
              <label className="mb1" htmlFor="release-targeting-groups-search">
                {translate('tallennettukohdennus')}
              </label>

              <div className="editor-targeting-group-select col-12 lg-col-5 lg-ml3">
                {targetingGroups.items.map(targetingGroup =>
                  <div key={`releaseTargetingGroup${targetingGroup.id}`} className="flex flex-wrap">
                    <div className="col-9 my1 sm-pr2">
                      <TargetingGroupButton
                        id={targetingGroup.id}
                        text={targetingGroup.name}
                        disabled={targetingGroup.isRemoving}
                        onClick={controller.toggleTargetingGroup}
                        isActive={release.selectedTargetingGroup === targetingGroup.id}
                      />

                      {
                        targetingGroup.hasRemoveFailed
                          ? <div className="oph-error px2">{translate('poistaminenepaonnistui')}</div>
                          : null
                      }
                    </div>

                    <div className="flex flex-auto items-center justify-end my1 pr2">
                      <RemoveTargetingGroupButton
                        id={targetingGroup.id}
                        disabled={targetingGroup.isRemoving}
                        onClick={controller.removeTargetingGroup}
                        isLoading={targetingGroup.isRemoving}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            : null
        }

        {/*Categories*/}
        <div className="col-12 lg-col-3 sm-pr2 mb2 lg-mb0" data-selenium-id="release-category">
          <Fieldset legend={translate('julkkategoria')}>
            {categories.map(category =>
              <div key={`releaseCategory${category.id}`} className="mb1">
                <Checkbox
                  label={translate(category.name)}
                  checked={isCategoryChecked(category.id, release.categories)}
                  value={category.id}
                  onChange={handleCategoryChange}
                />
              </div>
            )}
          </Fieldset>
        </div>

        {/*User groups*/}
        <div className="col-12 lg-col-4 lg-px2 mb2 lg-mb0">
          <Field
            name="release-usergroups-search"
            label={translate(getUserGroupsKey(release.categories.length))}
            isRequired
          >
            <Dropdown
              className="semantic-ui"
              fluid
              multiple
              name="release-usergroups"
              noResultsMessage={translate('eiryhma')}
              onChange={handleUserGroupsChange}
              options={mapDropdownOptions(unselectedUserGroups, user.lang.toUpperCase())}
              placeholder={translate('lisaaryhma')}
              search
              selection
              value={[]}
            />
          </Field>
        </div>

        {/*Selected user groups*/}
        <div className="col-12 lg-col-4 lg-pl2" data-selenium-id="release-selected-user-groups">
          <div className="invisible xs-hide sm-hide md-hide mb1">{translate('valitutryhmat')}</div>

          {
            release.userGroups
              ? release.userGroups.map(group =>
                <UserGroupButton
                  key={`releaseUserGroup${group}`}
                  id={group}
                  text={getUserGroupDescription(group, userGroupsWithAllItem)}
                  onClick={controller.toggleUserGroup}
                />
              )
              : null
          }
        </div>
      </div>

      {/*Tag groups*/}
      {
        notification.validationState === 'empty'
          ? null
          : <div className="p3 border-top" data-selenium-id="notification-tag-groups">
            <div className="mb2">{translate('tiedotteenavainsanat')} *</div>

            {tagGroups.map(tagGroup =>
              <Fieldset key={`notificationTagGroup${tagGroup.id}`} legend={translate(tagGroup.name)}>
                <CheckboxButtonGroup
                  groupId={tagGroup.id}
                  htmlId="notification-tag"
                  options={tagGroup.tags}
                  selectedOptions={notification.tags}
                  disabled={isTagGroupDisabled(tagGroup, release.categories)}
                  onChange={controller.toggleTag}
                />
              </Fieldset>
            )}
          </div>
      }

      <div className="pt3 px3 border-top">
        {/*Save targeting selections*/}
        <div className="flex items-center justify-center col-12">
          <label
            className="block md-inline-block mb1 md-mb0 mr2"
            htmlFor="targeting-name"
          >
            {translate('kohderyhmavalinnannimi')}
          </label>

          <input
            className="oph-input md-col-6 lg-col-3"
            data-selenium-id="targeting-name"
            type="text"
            name="targeting-name"
            value={release.targetingGroup}
            onChange={handleTargetingGroupNameChange}
          />
        </div>

        {/*Send email to user groups*/}
        {
          notification.validationState === 'empty'
            ? null
            : <div className="flex justify-center col-12 mt2">
              <Checkbox
                label={translate('lahetasahkoposti')}
                checked={notification.sendEmail}
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
