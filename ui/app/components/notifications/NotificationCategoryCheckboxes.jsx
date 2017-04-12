import React, { PropTypes } from 'react'
import R from 'ramda'

import Checkbox from '../common/form/Checkbox'
import Delay from '../common/Delay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  selectedCategories: PropTypes.array.isRequired
}

function NotificationCategoryCheckboxes (props) {
  const {
    controller,
    categories,
    selectedCategories
  } = props

  const {
    items,
    isLoading,
    hasLoadingFailed
  } = categories

  const handleCategoryChange = event => {
    const value = parseInt(event.target.value, 10)

    controller.toggleCategory(value)
  }

  const isCategoryChecked = (id, categories) => {
    return R.contains(id, categories)
  }

  return (
    <div className="flex flex-wrap">
      {
        isLoading
          ? <Delay time={1000}>
            <Spinner isVisible />
          </Delay>
          : null
      }

      {
        hasLoadingFailed
          ? <div className="oph-error center col-12">{translate('kategorioidenhakuepaonnistui')}</div>
          : items.map(category =>
            <div
              key={`notificationCategory${category.id}`}
              className="col-12 sm-col-6 lg-col-4 sm-pr1"
            >
              <Checkbox
                label={category.name}
                checked={isCategoryChecked(category.id, selectedCategories)}
                value={category.id}
                onChange={handleCategoryChange}
              />
            </div>
          )
      }
    </div>
  )
}

NotificationCategoryCheckboxes.propTypes = propTypes

export default NotificationCategoryCheckboxes
