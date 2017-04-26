import React, { PropTypes } from 'react'
import R from 'ramda'

import Checkbox from '../common/form/Checkbox'
import Collapse from '../common/Collapse'
import Delay from '../common/Delay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  selectedCategories: PropTypes.array.isRequired,
  isVisible: PropTypes.bool
}

const defaultProps = {
  isVisible: false
}

function NotificationCategoryCheckboxes (props) {
  const {
    controller,
    categories,
    selectedCategories,
    isVisible
  } = props

  const {
    items,
    isLoading,
    hasLoadingFailed
  } = categories

  const getNotificationSelectedCategoriesString = categoriesAmount => {
    return categoriesAmount === 0
      ? translate('eirajoituksia')
      : categoriesAmount
  }

  const handleCategoryChange = event => {
    const value = parseInt(event.target.value, 10)

    controller.toggleCategory(value)
  }

  const isCategoryChecked = (id, categories) => {
    return R.contains(id, categories)
  }

  return (
    <Collapse
      id="notification-categories-collapse"
      title={
        `${translate('rajoitanakyviatiedotteita')}
        (${getNotificationSelectedCategoriesString(selectedCategories.length)})`
      }
      isVisible={isVisible}
    >
      <div className="flex flex-wrap">
        {/*Display spinner while fetching categories*/}
        {
          isLoading
            ? <Delay time={1000}>
              <Spinner isVisible />
            </Delay>
            : null
        }

        {/*Display error or category checkboxes depending on the result of the fetch*/}
        {
          hasLoadingFailed
            ? <div className="oph-error center col-12">{translate('kategorioidenhakuepaonnistui')}</div>
            : items.map(category =>
              <div
                key={`notificationCategory${category.id}`}
                className="col-12 sm-col-6 lg-col-4 sm-pr1"
              >
                <Checkbox
                  label={translate(category.name)}
                  checked={isCategoryChecked(category.id, selectedCategories)}
                  value={category.id}
                  onChange={handleCategoryChange}
                />
              </div>
            )
        }
      </div>
    </Collapse>
  )
}

NotificationCategoryCheckboxes.propTypes = propTypes
NotificationCategoryCheckboxes.defaultProps = defaultProps

export default NotificationCategoryCheckboxes
