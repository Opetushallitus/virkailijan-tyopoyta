import React, { PropTypes } from 'react'
import { Dropdown } from 'semantic-ui-react'

import { translate } from '../common/Translations'

import mapDropdownOptions from '../utils/mapDropdownOptions'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  selectedOptions: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isInitialLoad: PropTypes.bool.isRequired
}

function CategorySelect (props) {
  const {
    controller,
    locale,
    options,
    selectedOptions,
    isLoading,
    isInitialLoad
  } = props

  const handleChange = (event, { value }) => {
    controller.setSelectedCategories(value)
  }

  const handleLabelClick = (event, { value }) => {
    controller.toggleCategory(value)
  }

  return (
    <div>
      <label className="hide" htmlFor="view-categories-search">{translate('suodatanakymaakategorioilla')}</label>

      <Dropdown
        className="semantic-ui"
        name="view-categories"
        fluid
        multiple
        noResultsMessage={translate('eikategorioita')}
        onChange={handleChange}
        onLabelClick={handleLabelClick}
        options={isInitialLoad ? [] : mapDropdownOptions(options, locale)}
        placeholder={isLoading || isInitialLoad ? translate('haetaankategorioita') : translate('suodatanakymaa')}
        search
        selection
        scrolling
        value={selectedOptions}
      />
    </div>
  )
}

CategorySelect.propTypes = propTypes

export default CategorySelect
