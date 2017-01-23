import React, { PropTypes } from 'react'
import R from 'ramda'
import { Dropdown } from 'semantic-ui-react'

import UserGroupButton from './UserGroupButton'
import Field from '../common/form/Field'
import Fieldset from '../common/form/Fieldset'
import CheckboxButtonGroup from '../common/form/CheckboxButtonGroup'
import { translate } from '../common/Translations'

import mapDropdownOptions from '../utils/mapDropdownOptions'

const propTypes = {
  locale: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  release: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  userGroups: PropTypes.array.isRequired
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

  /* Get unselected user groups for Dropdown options */
  const selectableUserGroups = R.reject(
    group => R.contains(group.id, release.userGroups),
    userGroups
  )

  const getUserGroupName = (id, userGroups, locale) => {
    return R.find(R.propEq('id', id))(userGroups)[`name_${locale}`]
  }

  return (
    <div>
      <h2 className="hide">{translate('julkkategoriaryhma')}</h2>

      <div className="flex flex-wrap">
        {/*Categories*/}
        <div className="col-12 sm-pr2">
          <Fieldset isRequired legend={translate('julkkategoria')}>
            <CheckboxButtonGroup
              locale={locale}
              htmlId="release-category"
              options={categories}
              selectedOptions={release.categories}
              onChange={controller.toggleReleaseCategory}
            />
          </Fieldset>
        </div>

        {/*User groups*/}
        <div className="col-12 sm-col-6 sm-pr2">
          <Field name="release-usergroups" label={translate('julkryhma')}>
            <Dropdown
              className="semantic-ui"
              fluid
              multiple
              name="release-usergroups"
              noResultsMessage={translate('eiryhma')}
              onChange={handleOnUserGroupsChange}
              options={mapDropdownOptions(selectableUserGroups, locale)}
              placeholder={translate('lisaaryhma')}
              search
              selection
              value={[]}
            />
          </Field>
        </div>

        <div className="col-12 sm-col-6 sm-pl2">
          <div className="invisible mb1">{translate('valitutryhmat')}</div>
          {release.userGroups.map(group =>
            <UserGroupButton
              key={`usergroup${group}`}
              controller={controller}
              id={group}
              text={getUserGroupName(group, userGroups, locale)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

Targeting.propTypes = propTypes

export default Targeting
