import React, { PropTypes } from 'react'
import R from 'ramda'

import { translate } from '../common/Translations'

const propTypes = {
  locale: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  selectedItems: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired
}

const getSelectedTargetingName = (id, items, locale) => {
  return R.find(R.propEq('id', id))(items)[`name_${locale}`]
}

function PreviewTargetingList (props) {
  const {
    locale,
    title,
    selectedItems,
    items
  } = props

  return (
    <div>
      <p className="bold pr2">{translate(title)}</p>

      <ul className="list-reset">
        {selectedItems.map(id =>
          <li key={`${title}${id}`} className="mb1">
            {getSelectedTargetingName(id, items, locale)}
          </li>
        )}
      </ul>
    </div>
  )
}

PreviewTargetingList.propTypes = propTypes

export default PreviewTargetingList
