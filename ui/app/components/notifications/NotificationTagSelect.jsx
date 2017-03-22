import React, { PropTypes } from 'react'
import { Dropdown } from 'semantic-ui-react'
import R from 'ramda'

import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  tagGroups: PropTypes.object.isRequired,
  selectedTags: PropTypes.array.isRequired,
  selectedCategories: PropTypes.array.isRequired
}

class NotificationTagSelect extends React.Component {
  constructor (props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleLabelClick = this.handleLabelClick.bind(this)
    this.mapDropdownOptions = this.mapDropdownOptions.bind(this)
    this.filterTagGroupsByCategories = this.filterTagGroupsByCategories.bind(this)
    this.getPlaceholderKey = this.getPlaceholderKey.bind(this)
  }

  // Filter selected tags if available tags are changed (i.e. when user selects categories)
  componentWillUpdate (nextProps) {
    if (this.props.tagGroups.length !== nextProps.tagGroups.length &&
      this.props.selectedTags.length > 0) {
      const selectedTags = this.props.selectedTags
      const allowedtags = R.pluck('id',
        R.flatten(R.pluck('tags', nextProps.tagGroups)))

      const filteredSelectedTags = R.filter(tag => R.contains(tag, allowedtags), selectedTags)

      this.props.controller.setSelectedTags(filteredSelectedTags)
    }
  }

  getPlaceholderKey () {
    const {
      isLoading,
      hasLoadingFailed
    } = this.props.tagGroups

    if (isLoading) {
      return 'haetaanavainsanoja'
    } else if (hasLoadingFailed) {
      return 'avainsanojenhakuepaonnistui'
    } else {
      return 'lisaahakusana'
    }
  }

  handleChange (event, { value }) {
    this.props.controller.setSelectedTags(value)
  }

  handleLabelClick (event, { value }) {
    this.props.controller.toggleTag(value)
  }

  /*
    Dropdown component takes options as an array of objects:
    [
      {
        value: [option's value],
        text: [displayed text],
        description: [displayed description]
      },
      ...
    ]

    Returns tags sorted by text
  */
  mapDropdownOptions () {
    const options = this.props.tagGroups.items.map(option =>
      option.tags.map(item => {
        return {
          value: item.id,
          text: item.name,
          description: option.name
        }
      })
    )

    return R.sortBy(R.prop('text'))(R.flatten(options))
  }

  // Return tag groups linked to selected categories or all tag groups if no categories are selected
  filterTagGroupsByCategories () {
    const tagGroups = this.props.tagGroups.items
    const selectedCategories = this.props.selectedCategories

    return selectedCategories.length === 0
      ? tagGroups
      : R.filter(tagGroup => R.length(R.intersection(tagGroup.categories, selectedCategories)), tagGroups)
  }

  render () {
    const {
      tagGroups,
      selectedTags
    } = this.props

    const renderDropdownLabel = label => ({
      // Text + description truncated to 30 characters
      content: `${label.text} - ${label.description}`
        .split('')
        .slice(0, 30)
        .join('')
        .concat('...')
    })

    return (
      <div>
        <label className="hide" htmlFor="notification-tag-select-search">{translate('suodatatiedotteita')}</label>

        <Dropdown
          className="notification-tag-select semantic-ui"
          name="notification-tag-select"
          fluid
          multiple
          noResultsMessage={translate('eitunnisteita')}
          onChange={this.handleChange}
          onLabelClick={this.handleLabelClick}
          options={tagGroups.isLoading ? [] : this.mapDropdownOptions()}
          placeholder={translate(this.getPlaceholderKey())}
          search
          selection
          scrolling
          renderLabel={renderDropdownLabel}
          value={selectedTags}
        />
      </div>
    )
  }
}

NotificationTagSelect.propTypes = propTypes

export default NotificationTagSelect
