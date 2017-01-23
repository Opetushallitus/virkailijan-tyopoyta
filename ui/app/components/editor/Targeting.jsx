import React, { PropTypes } from 'react'
import { Dropdown } from 'semantic-ui-react'

import Field from '../common/form/Field'
import Fieldset from '../common/form/Fieldset'
import CheckboxButtonGroup from '../common/form/CheckboxButtonGroup'
import { translate } from '../common/Translations'

import mapDropdownOptions from '../utils/mapDropdownOptions'

const propTypes = {
  locale: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  release: PropTypes.object.isRequired,
  notificationTags: PropTypes.array.isRequired
}

function Targeting (props) {
  const {
    locale,
    controller,
    categories,
    notificationTags,
    release
  } = props

  const handleOnTagsChange = (event, { value }) => {
    controller.updateNotificationTags(value)
  }

  const handleOnTagClick = (event, { value }) => {
    controller.updateNotificationTags(value)
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
              className="semantic-ui editor-select-usergroups"
              fluid
              multiple
              name="release-usergroups"
              noResultsMessage={translate('eiryhma')}
              onChange={handleOnTagsChange}
              onLabelClick={handleOnTagClick}
              options={mapDropdownOptions(notificationTags, locale)}
              placeholder={translate('lisaaryhma')}
              search
              selection
              value={release.notification.tags}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}

Targeting.propTypes = propTypes

export default Targeting
