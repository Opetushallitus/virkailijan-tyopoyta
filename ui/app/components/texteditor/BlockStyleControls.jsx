import React, { PropTypes } from 'react'
import R from 'ramda'

import { translate } from '../common/Translations'
import StyleButton from './StyleButton'

const propTypes = {
  controls: PropTypes.array.isRequired,
  editorState: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
}

const BLOCK_TYPES = [
  {label: translate('järjestamatonlista'), style: 'unordered-list-item', icon: 'list-ul'},
  {label: translate('jarjestettylista'), style: 'ordered-list-item', icon: 'list-ol'}
]

function BlockStyleControls (props) {
  const {
    controls,
    editorState,
    onClick
  } = props

  const selection = editorState.getSelection()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()

  // Get types from BLOCK_TYPES whose style is defined in props.controls
  const types = R.filter(type => R.contains(type.style, controls), BLOCK_TYPES)

  return (
    <span className="RichEditor-controls">
      {types.map((type) =>
        <StyleButton
          key={type.label}
          label={type.label}
          style={type.style}
          icon={type.icon}
          isActive={type.style === blockType}
          onClick={onClick}
        />
      )}
    </span>
  )
}

BlockStyleControls.propTypes = propTypes

export default BlockStyleControls
