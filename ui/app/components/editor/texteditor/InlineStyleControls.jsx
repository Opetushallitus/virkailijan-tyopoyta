import React, { PropTypes } from 'react'
import R from 'ramda'

import { translate } from '../../common/Translations'
import StyleButton from './StyleButton'

const propTypes = {
  controls: PropTypes.array.isRequired,
  currentStyle: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
}

const INLINE_STYLES = [
  {title: translate('lihavoi'), style: 'BOLD', icon: 'bold'},
  {title: translate('kursivoi'), style: 'ITALIC', icon: 'italic'},
  {title: translate('alleviivaa'), style: 'UNDERLINE', icon: 'underline'}
]

function InlineStyleControls (props) {
  const {
    controls,
    currentStyle,
    onClick
  } = props

  // Get styles from INLINE_STYLES whose style is defined in props.controls
  const styles = R.filter(type => R.contains(type.style, controls), INLINE_STYLES)

  return (
    <span className="RichEditor-controls">
      {styles.map(type =>
        <StyleButton
          key={`richEditorButton${type.style}`}
          title={type.title}
          style={type.style}
          icon={type.icon}
          isActive={currentStyle.has(type.style)}
          onClick={onClick}
        />
      )}
    </span>
  )
}

InlineStyleControls.propTypes = propTypes

export default InlineStyleControls
