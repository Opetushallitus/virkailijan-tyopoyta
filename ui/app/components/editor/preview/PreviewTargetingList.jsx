import React, { PropTypes } from 'react'

import { translate } from '../../common/Translations'

const propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired
}

function PreviewTargetingList (props) {
  const {
    title,
    items
  } = props

  return (
    <div>
      <p className="bold pr2">{translate(title)}</p>

      <ul className="list-reset">
        {items.map(item =>
          <li key={`${title}${item.id}`} className="mb1">{item.name}</li>
        )}
      </ul>
    </div>
  )
}

PreviewTargetingList.propTypes = propTypes

export default PreviewTargetingList
