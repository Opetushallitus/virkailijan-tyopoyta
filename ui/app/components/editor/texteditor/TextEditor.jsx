import React, { PropTypes } from 'react'
import R from 'ramda'
import {
  Editor,
  EditorState,
  RichUtils,
  CompositeDecorator,
  SelectionState,
  Entity
} from 'draft-js'
import { convertToHTML, convertFromHTML } from 'draft-convert'

// Components
import Link from './Link'
import EditLink from './EditLink'
import InlineStyleControls from './InlineStyleControls'
import BlockStyleControls from './BlockStyleControls'
import CloseButton from '../../common/buttons/CloseButton'
import IconButton from '../../common/buttons/IconButton'
import { translate } from '../../common/Translations'

import { getEntityAtCursor } from './getEntityAtCursor'

const propTypes = {
  data: PropTypes.string,
  save: PropTypes.func.isRequired,
  controls: PropTypes.array
}

const defaultProps = {
  data: '',
  controls: []
}

function startsWith (url, searchString, position) {
  position = position || 0
  return this.substr(position, searchString.length) === searchString
}

function findLinkEntities (contentBlock, callback) {
  contentBlock.findEntityRanges(
    character => {
      const entityKey = character.getEntity()

      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'LINK'
      )
    },
    callback
  )
}

function htmlToEntity (nodeName, node) {
  if (nodeName === 'a') {
    return Entity.create(
      'LINK',
      'MUTABLE',
      { url: node.href }
    )
  }
}

class TextEditor extends React.Component {
  constructor (props) {
    super(props)

    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link
      }
    ])

    this.state = {
      editorState: EditorState.createWithContent(convertFromHTML({ htmlToEntity })(this.props.data), decorator),
      showURLInput: false
    }

    this.focus = () => this.editor.focus()

    this.onChange = (editorState) => {
      this.setState({editorState})
    }

    this.handleKeyCommand = (command) => this._handleKeyCommand(command)
    this.onTab = (e) => this._onTab(e)
    this.toggleBlockType = (type) => this._toggleBlockType(type)
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style)
    this.onURLChange = (e) => this.setState({urlValue: e.target.value})

    this.promptForLink = this._promptForLink.bind(this)
    this.confirmLink = this._confirmLink.bind(this)
    this.removeLink = this._removeLink.bind(this)
    this.save = this._save.bind(this)
    this.getSelectedText = this._getSelectedText.bind(this)
  }

  _save () {
    const content = this.state.editorState.getCurrentContent()

    const plainText = content.getPlainText()

    // Only save HTML if the content contains more than line breaks or empty spaces
    if (plainText.trim().length === 0) {
      this.props.save('')
    } else {
      const html = convertToHTML({
        entityToHTML: (entity, originalText) => {
          if (entity.type === 'LINK') {
            return <a href={entity.data.url}>{originalText}</a>
          }
          return originalText
        }
      })(content)

      this.props.save(html)
    }
  }

  _handleKeyCommand (command) {
    const {editorState} = this.state
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      this.onChange(newState)
      return true
    }
    return false
  }

  _onTab (e) {
    const maxDepth = 4
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth))
  }

  _toggleBlockType (blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    )
  }

  _toggleInlineStyle (inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    )
  }

  _promptForLink (e) {
    e.preventDefault()

    const {
      editorState
    } = this.state

    // Update link's text with text from editor's content
    const entity = getEntityAtCursor(editorState)
    const isCursorOnLink = (this._getEntityAtCursor(editorState) !== null &&
      this._getEntityAtCursor(editorState).type === 'LINK')

    if (isCursorOnLink) {
      const text = editorState
        .getCurrentContent()
        .getBlockForKey(entity.blockKey)
        .getText()
        .slice(entity.startOffset, entity.endOffset)

      Entity.mergeData(entity.entityKey, { text: text })
    }

    this.setState({
      showURLInput: !this.state.showURLInput,
      urlValue: ''
    })
  }

  _confirmLink (url, text) {
    const urlWithHttp = startsWith(url, 'http://') || startsWith(url, 'https://')
      ? url
      : `http://${url.replace('http://', '')}`

    console.log('Confirming link ' + urlWithHttp + ' for text ' + text)

    const {
      editorState
    } = this.state

    const previousLink = getEntityAtCursor(editorState)
    let selection = editorState.getSelection()

    // Create SelectionState from previous link's text
    if (previousLink) {
      selection = new SelectionState({
        anchorKey: previousLink.blockKey,
        anchorOffset: previousLink.startOffset,
        focusKey: previousLink.blockKey,
        focusOffset: previousLink.endOffset
      })
    }

    const entityKey = Entity.create('LINK', 'MUTABLE', { url: urlWithHttp, text: text })

    this.setState({
      editorState: RichUtils.toggleLink(
        editorState,
        selection,
        entityKey
      ),
      showURLInput: false,
      urlValue: ''
    }, () => {
      setTimeout(() => this.editor.focus(), 0)
    })
  }

  _removeLink (e) {
    e.preventDefault()
    const {editorState} = this.state

    const link = getEntityAtCursor(editorState)

    // Create SelectionState from link's text
    const selection = new SelectionState({
      anchorKey: link.blockKey,
      anchorOffset: link.startOffset,
      focusKey: link.blockKey,
      focusOffset: link.endOffset
    })

    this.setState({
      editorState: RichUtils.toggleLink(editorState, selection, null),
      showURLInput: false
    }, () => {
      setTimeout(() => this.editor.focus(), 0)
    })
  }

  _getSelectedText (selection) {
    const {editorState} = this.state
    const start = selection.getStartOffset()
    const end = selection.getEndOffset()
    const startKey = selection.getStartKey()

    return editorState
      .getCurrentContent()
      .getBlockForKey(startKey)
      .getText()
      .slice(start, end)
      .trim()
  }

  _getEntityAtCursor () {
    const {editorState} = this.state
    const entity = getEntityAtCursor(editorState)

    return (entity === null) ? null : Entity.get(entity.entityKey)
  }

  render () {
    const {
      controls
    } = this.props

    const {
      editorState
    } = this.state

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor'
    let contentState = editorState.getCurrentContent()
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder'
      }
    }

    let selection = editorState.getSelection()
    let entity = this._getEntityAtCursor(editorState)
    let isCursorOnLink = (entity !== null && entity.type === 'LINK')

    const selectedText = this.getSelectedText(selection)
    const hasSelectedText = this.getSelectedText(selection).length

    return (
      <div className={`RichEditor-root ${this.state.showURLInput ? 'editor-has-link-form' : ''}`}>
        <div className="RichEditor-controls-container">
          <InlineStyleControls
            controls={controls}
            currentStyle={editorState.getCurrentInlineStyle()}
            onClick={this.toggleInlineStyle}
          />

          <BlockStyleControls
            controls={controls}
            editorState={editorState}
            onClick={this.toggleBlockType}
          />

          <IconButton
            id="RichEditor-edit-link-button"
            title={isCursorOnLink ? translate('muokkaalinkki') : translate('lisaalinkki')}
            isActive={this.state.showURLInput}
            disabled={!isCursorOnLink && !hasSelectedText}
            icon="link"
            onClick={this.promptForLink}
          />

          <IconButton
            id="RichEditor-remove-link-button"
            title={translate('poistalinkki')}
            disabled={!isCursorOnLink}
            icon="unlink"
            onClick={this.removeLink}
          />

          <h3 className={this.state.showURLInput ? 'hide' : 'display-none'}>
            {translate('lisaalinkki')}
          </h3>

          {/*Cancel link editing*/}
          <div className={`absolute top-0 right-0 z3 ${this.state.showURLInput ? '' : 'display-none'}`}>
            <CloseButton
              title={translate('peruuta')}
              onClick={this.promptForLink}
            />
          </div>

          {this.state.showURLInput
            ? <EditLink
              url={R.pathOr('', ['data', 'url'], entity)}
              selectedLinkText={R.pathOr('', ['data', 'text'], entity)}
              selectedText={selectedText}
              confirmLink={this.confirmLink}
            />
            : ''
          }
        </div>

        <div className={className} onClick={this.focus}>
          <Editor
            ref={editor => { this.editor = editor }}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            onBlur={this.save}
            onTab={this.onTab}
            spellCheck
          />
        </div>
      </div>
    )
  }
}

TextEditor.propTypes = propTypes
TextEditor.defaultProps = defaultProps

export default TextEditor
