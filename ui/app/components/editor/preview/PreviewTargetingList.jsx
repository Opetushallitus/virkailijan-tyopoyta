import React, { PropTypes } from 'react'

import { translate } from '../../common/Translations'

const propTypes = {
  locale: PropTypes.string,
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired
}

const defaultProps = {
  locale: ''
}

function PreviewTargetingList (props) {
  const {
    locale,
    title,
    items
  } = props

  return (
    <div>
      <p className="bold pr2">{translate(title)}</p>

      <ul className="list-reset">
        {items.map(item =>
          <li key={`${title}${item.id}`} className="mb1">{item.name || item.description[locale]}</li>
        )}
      </ul>
    </div>
  )
}

PreviewTargetingList.propTypes = propTypes
PreviewTargetingList.defaultProps = defaultProps

export default PreviewTargetingList
