import React from 'react'
import R from 'ramda'
import { Editor, EditorState, RichUtils, CompositeDecorator, ContentState, SelectionState, Entity } from 'draft-js';
import { convertToHTML, convertFromHTML } from 'draft-convert';

import { getEntityAtCursor } from './getEntityAtCursor';

// Components
import Button from '../Button'
import Icon from '../Icon'
import Translation,{translate} from '../Translations'

export default class TextEditor extends React.Component {
  constructor(props) {
    super(props)

    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link,
      },
    ])

    this.state = {
      editorState: EditorState.createWithContent(convertFromHTML(this.props.data), decorator),
      showURLInput: false
    }

    this.focus = () => this.refs.editor.focus()

    this.onChange = (editorState) => {
      this.setState({editorState})
    }

    this.handleKeyCommand = (command) => this._handleKeyCommand(command)
    this.onTab = (e) => this._onTab(e)
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style)
    this.onURLChange = (e) => this.setState({urlValue: e.target.value})

    this.promptForLink = this._promptForLink.bind(this)
    this.confirmLink = this._confirmLink.bind(this)
    this.removeLink = this._removeLink.bind(this)
    this.save = this._save.bind(this)
    this.getSelectedText = this._getSelectedText.bind(this)
  }

  _save() {
    const content = this.state.editorState.getCurrentContent()

    // Only save HTML if the content contains more than line breaks or empty spaces
    const plainText = content.getPlainText().trim()

    if (plainText.length === 0) {
      this.props.save('')
    }
    else {
      const html = convertToHTML({
        entityToHTML: (entity, originalText) => {
          if (entity.type === 'LINK') {
            return <a href={entity.data.url}>{originalText}</a>
          }
          return originalText
        }
      })(content)

      console.log(html)

      this.props.save(html)
    }
  }

  _handleKeyCommand(command) {
    const {editorState} = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _onTab(e) {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  _promptForLink(e) {
    e.preventDefault();

    const {editorState} = this.state;

    // Update link's text with text from editor's content
    const entity = getEntityAtCursor(editorState)
    const isCursorOnLink = (this._getEntityAtCursor(editorState) !== null
      && this._getEntityAtCursor(editorState).type === 'LINK')

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
      urlValue: '',
    });
  }

  _confirmLink(url, text) {
    console.log("Confirming link", url, text);

    // e.preventDefault();
    const {editorState, urlValue} = this.state;

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

    const entityKey = Entity.create('LINK', 'MUTABLE', {url: url, text: text});

    this.setState({
      editorState: RichUtils.toggleLink(
        editorState,
        selection,
        entityKey
      ),
      showURLInput: false,
      urlValue: '',
    }, () => {
      setTimeout(() => this.refs.editor.focus(), 0);
    });
  }

  _removeLink(e) {
    e.preventDefault();
    const {editorState} = this.state;

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
    });
  }

  _onLinkInputKeyDown(e) {
    if (e.which === 13) {
      this._confirmLink(e)
    }
  }

  _getSelectedText (selection, content) {
    const start = selection.getStartOffset()
    const end = selection.getEndOffset()
    const startKey = selection.getStartKey()

    const selectedText = content
      .getBlockForKey(startKey)
      .getText()
      .slice(start, end)
      .trim()

    return selectedText
  }

  _getEntityAtCursor(editorState) {
    // let {editorState} = this.props;
    console.log("getentityatcursor");
    let entity = getEntityAtCursor(editorState);
    return (entity == null) ? null : Entity.get(entity.entityKey);
  }

  render() {
    const {editorState} = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    let selection = editorState.getSelection();
    let entity = this._getEntityAtCursor(editorState);
    let isCursorOnLink = (entity != null && entity.type == 'LINK');

    const selectedText = this.getSelectedText(editorState.getSelection(), contentState)
    const hasSelectedText = this.getSelectedText(editorState.getSelection(), contentState).length

    const INLINE_STYLES = [
      {label: translate("lihavoi"), style: 'BOLD', icon: 'bold'},
      {label: translate("kursivoi"), style: 'ITALIC', icon: 'italic'},
      {label: translate("alleviivaa"), style: 'UNDERLINE', icon: 'underline'}
    ];

    const InlineStyleControls = (props) => {
      const currentStyle = props.editorState.getCurrentInlineStyle();
      return (
          <span className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
          <StyleButton
              key={type.label}
              active={currentStyle.has(type.style)}
              label={type.label}
              onToggle={props.onToggle}
              style={type.style}
              icon={type.icon}
          />
      )}
    </span>
      );
    };

    const BLOCK_TYPES = [
      {label: translate("järjestamatonlista"), style: 'unordered-list-item', icon: 'list-ul'},
      {label: translate("jarjestettylista"), style: 'ordered-list-item', icon: 'list-ol'}
    ];

    const BlockStyleControls = (props) => {
      const {editorState} = props;
      const selection = editorState.getSelection();
      const blockType = editorState
          .getCurrentContent()
          .getBlockForKey(selection.getStartKey())
          .getType();

      return (
          <span className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
          <StyleButton
              key={type.label}
              active={type.style === blockType}
              label={type.label}
              onToggle={props.onToggle}
              style={type.style}
              icon={type.icon}
          />
      )}
    </span>
      );
    };

    return (
      <div className='RichEditor-root'>
        <div className="RichEditor-controls-container">
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />

          <LinkButton
            label={isCursorOnLink ? translate("muokkaalinkki") : translate("lisaalinkki")}
          icon="link"
            active={this.state.showURLInput}
            disabled={!isCursorOnLink && !hasSelectedText}
            action={this.promptForLink}
          />

          <LinkButton
            action={this.removeLink}
            icon="unlink"
            label={translate("poistalinkki")}
            disabled={!isCursorOnLink}
          />

          <h3 className={this.state.showURLInput ? 'hide' : 'display-none'}><Translation trans="lisaalinkki"/></h3>

          {/*Cancel add link*/}
          <Button
            classList={`button-link h1 absolute top-0 right-0 z3 ${this.state.showURLInput ? '' : 'display-none'}`}
            onClick={this.promptForLink}
            title={<Translation trans="peruuta"/>}
          >
            &times;
            <span className="hide"><Translation trans="peruuta"/></span>
          </Button>

          {this.state.showURLInput
            ?
              <UrlInput
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
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            onBlur={this.save}
            onTab={this.onTab}
            ref="editor"
            spellCheck={true}
          />
        </div>
      </div>
    );
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'button-link gray-lighten-1 RichEditor-styleButton'

    if (this.props.active) {
      className += ' blue-lighten-1'
    }

    return (
      <Button
        classList={className}
        onMouseDown={this.onToggle}
        title={this.props.label}
      >
        <Icon name={this.props.icon} />
        <span className="hide">{this.props.label}</span>
      </Button>
    )
  }
}

class LinkButton extends React.Component {
  render(){
    let className = 'button-link RichEditor-styleButton'

    if (this.props.active) {
      className += ' button-link-is-active'
    }

    return(
      <Button
        classList={className}
        title={this.props.label}
        disabled={this.props.disabled}
        onClick={this.props.action}
      >
        <Icon name={this.props.icon} />
        <span className="hide">{this.props.label}</span>
      </Button>
    )
  }
}

function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
}

const Link = (props) => {
  const {url} = Entity.get(props.entityKey).getData();
  return (
    <a href={url} title={url}>
      {props.children}
    </a>
  );
};

export class UrlInput extends React.Component{
  constructor(props){
    super();
    this.state = {url: props.url};
    this.onURLChange = this._onURLChange.bind(this);
    this.confirmLink = props.confirmLink;
  }

  _onURLChange(e){
    this.setState({url: e.target.value})
  }

  render() {
    const {
      selectedText,
      selectedLinkText
    } = this.props

    return (
      <div className="absolute top-0 right-0 bottom-0 left-0 z2 m2 bg-white">
        <div className="field flex flex-wrap">
          <div className="md-col-3 pr2"><Translation trans="linkkiteksti"/></div>
          <div className="md-col-8 muted">{selectedLinkText ? selectedLinkText : selectedText}</div>
        </div>

        <div className="input-group col-12">
          <label className="hide" htmlFor="notification-url"><Translation trans="linkkiosoite"/></label>

          <input
            ref="url"
            className="input"
            type="url"
            name="notification-url"
            autoFocus
            autoCapitalize={false}
            value={this.state.url}
            placeholder={translate("linkkiosoite")}
            onChange={this.onURLChange}
          />
          <Button
            classList="button-primary input-group-button"
            disabled={!this.state.url}
            onClick={() => this.confirmLink(this.state.url, selectedText)}
          >
            <Translation trans="tallenna"/>
          </Button>
        </div>
      </div>
    )
  }
}
