import React, { PropTypes } from 'react'
import { Dropdown } from 'semantic-ui-react'
import R from 'ramda'

import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  selectedTags: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isInitialLoad: PropTypes.bool.isRequired
}

class NotificationTagSelect extends React.Component {
  constructor (props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleLabelClick = this.handleLabelClick.bind(this)
    this.mapDropdownOptions = this.mapDropdownOptions.bind(this)
  }

  // Filter selected tags if available tags are changed (i.e. when user selects categories)
  componentWillUpdate (nextProps) {
    if (this.props.tags.length !== nextProps.tags.length &&
      this.props.selectedTags.length > 0) {
      const selectedTags = this.props.selectedTags
      const allowedtags = R.pluck('id',
        R.flatten(R.pluck('items', nextProps.tags)))

      const filteredSelectedTags = R.filter(tag => R.contains(tag, allowedtags), selectedTags)

      this.props.controller.setSelectedTags(filteredSelectedTags)
    }
  }

  handleChange (event, { value }) {
    this.props.controller.setSelectedTags(value)
  }

  handleLabelClick (event, { value }) {
    this.props.controller.toggleTag(value)
  }

  /*
    Dropdown component takes tags as an array of objects:
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
    const options = this.props.tags.map(option =>
      option.items.map(item => {
        return {
          value: item.id,
          text: item.name,
          description: option.name
        }
      })
    )

    return R.sortBy(R.prop('text'))(R.flatten(options))
  }

  render () {
    const {
      selectedTags,
      isLoading,
      isInitialLoad
    } = this.props

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
          options={isInitialLoad ? [] : this.mapDropdownOptions()}
          placeholder={isLoading || isInitialLoad ? translate('haetaantunnisteita') : translate('hakusana')}
          search
          selection
          scrolling
          value={selectedTags}
        />
      </div>
    )
  }
}

NotificationTagSelect.propTypes = propTypes

export default NotificationTagSelect
