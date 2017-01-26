import React, { PropTypes } from 'react'
import R from 'ramda'

import { translate } from '../common/Translations'

const propTypes = {
  locale: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  selectedItems: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired
}

function PreviewTargetingList (props) {
  const {
    locale,
    title,
    selectedItems,
    items
  } = props

  console.log(selectedItems, items)

  const getSelectedTargetingName = (id, items, locale) => {
    return R.find(R.propEq('id', id))(items)[`name_${locale}`]
  }

  return (
    <div>
      <p>{translate(title)}</p>

      <ul className="list-reset ml3">
        {selectedItems.map(item =>
          <li key={`${title}${item}`} className="italic mb2">
            {getSelectedTargetingName(item, items, locale)}
          </li>
        )}
      </ul>
    </div>
  )
}

PreviewTargetingList.propTypes = propTypes

export default PreviewTargetingList
