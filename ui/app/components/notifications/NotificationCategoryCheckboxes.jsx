import React, { PropTypes } from 'react'
import R from 'ramda'

import Checkbox from '../common/form/Checkbox'
import Delay from '../common/Delay'
import Spinner from '../common/Spinner'

const propTypes = {
  controller: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  selectedCategories: PropTypes.array.isRequired,
  isInitialLoad: PropTypes.bool.isRequired
}

function NotificationCategoryCheckboxes (props) {
  const {
    controller,
    categories,
    selectedCategories,
    isInitialLoad
  } = props

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
        isInitialLoad
          ? <Delay time={1000}>
            <Spinner isVisible />
          </Delay>
          : categories.map(category =>
            <div key={`notificationCategory${category.id}`} className="col-12 sm-col-6 lg-col-4 mb2 md-mb1 sm-pr1">
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
