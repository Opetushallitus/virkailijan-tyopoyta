import React, { PropTypes } from 'react'
import R from 'ramda'
import { Dropdown } from 'semantic-ui-react'

import UserGroupButton from './UserGroupButton'
import Field from '../common/form/Field'
import Fieldset from '../common/form/Fieldset'
import Checkbox from '../common/form/Checkbox'
import CheckboxButtonGroup from '../common/form/CheckboxButtonGroup'
import { translate } from '../common/Translations'
import * as testData from '../../resources/test/testData.json'

import mapDropdownOptions from '../utils/mapDropdownOptions'

const propTypes = {
  locale: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  userGroups: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  // tags: PropTypes.array.isRequired,
  release: PropTypes.object.isRequired
}

function Targeting (props) {
  const {
    locale,
    controller,
    userGroups,
    categories,
    // tags,
    release
  } = props

  const handleCategoryChange = event => {
    // Change checkbox value to int for consistency
    const value = parseInt(event.target.value, 10)

    controller.toggleCategory(value)
  }

  const itemHasCategory = (item, selectedCategories) => {
    // "All user groups" selection has id -1, display it always
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

  const handleUserGroupsChange = (event, { value }) => {
    controller.toggleUserGroup(value)
  }

  // Returns all user groups or those linked to selected categories
  const getFilteredUserGroups = (userGroups, selectedCategories) => {
    return selectedCategories.length
      ? R.filter(userGroup => itemHasCategory(userGroup, selectedCategories), userGroups)
      : userGroups
  }

  const unselectedUserGroups = release.userGroups
    ? R.reject(
      userGroup => R.contains(userGroup.id, release.userGroups),
      getFilteredUserGroups(userGroups, release.categories)
    )
    : []

  const getUserGroupName = (id, groups, locale) => {
    return R.find(R.propEq('id', id))(groups)[`name_${locale}`]
  }

  // Returns all tags or those linked to selected categories
  const getFilteredTags = (tags, selectedCategories) => {
    return selectedCategories.length
      ? R.filter(tag => itemHasCategory(tag, selectedCategories), tags)
      : tags
  }

  const filteredTags = getFilteredTags(testData.tags, release.categories)

  return (
    <div>
      <h2 className="hide">{translate('julkkategoriaryhma')}</h2>

      <div className="flex flex-wrap mb3 px3">
        {/*Categories*/}
        <div className="col-12 sm-col-3 sm-pr2">
          <Fieldset legend={translate('julkkategoria')}>
            {categories.map(category =>
              <div key={`releaseCategory${category.id}`} className="mb1">
                <Checkbox
                  label={category[`name_${locale}`]}
                  checked={isCategoryChecked(category.id, release.categories)}
                  value={category.id}
                  onChange={handleCategoryChange}
                />
              </div>
            )}
          </Fieldset>
        </div>

        {/*User groups*/}
        <div className="col-12 sm-col-4 sm-px2">
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
              options={mapDropdownOptions(unselectedUserGroups, locale)}
              placeholder={translate('lisaaryhma')}
              search
              selection
              value={[]}
            />
          </Field>
        </div>

        <div className="col-12 sm-col-4 sm-pl2">
          <div className="invisible xs-hide sm-hide mb1">{translate('valitutryhmat')}</div>

          {
            release.userGroups
              ? release.userGroups.map(group =>
                <UserGroupButton
                  key={`userGroup${group}`}
                  id={group}
                  text={getUserGroupName(group, userGroups, locale)}
                  onClick={controller.toggleUserGroup}
                />
              )
              : null
          }
        </div>
      </div>

      <div className="mb3 p3 border-top border-bottom border-gray-lighten-3">
        <div className="mb2">{translate('tiedotteenavainsanat')} *</div>

        {filteredTags.map(tags =>
          <Fieldset key={`notificationTags${tags.id}`} legend={tags[`name_${locale}`]}>
            <CheckboxButtonGroup
              locale={locale}
              htmlId="notification-tags"
              options={tags.items}
              selectedOptions={release.notification.tags}
              onChange={controller.toggleTag}
            />
          </Fieldset>
        )}
      </div>

      {/*Targeting selection name*/}
      <div className="center px3">
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

export default Targeting
