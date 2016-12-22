import React from 'react'
import R from 'ramda'
import { Editor, EditorState, RichUtils, CompositeDecorator, ContentState, Entity } from 'draft-js';
import { convertToHTML, convertFromHTML } from 'draft-convert';

import { getEntityAtCursor } from './getEntityAtCursor';

// Components
import Button from '../Button'
import Icon from '../Icon'

export default class TextEditor extends React.Component {
  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link,
      },
    ]);

    this.state = {
      //editorState: EditorState.createEmpty(decorator),
      editorState: EditorState.createWithContent(convertFromHTML(this.props.data)),
      showURLInput: false
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => this.setState({editorState});

    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.onTab = (e) => this._onTab(e);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.onURLChange = (e) => this.setState({urlValue: e.target.value});

    this.promptForLink = this._promptForLink.bind(this);
    this.confirmLink = this._confirmLink.bind(this);
    this.removeLink = this._removeLink.bind(this);
    this.save = this._save.bind(this);
  }

  _save() {
    const html = convertToHTML(this.state.editorState.getCurrentContent());
    console.log(html);
    this.props.save(html);
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
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.setState({
        showURLInput: true,
        urlValue: '',
      });
    }
  }

  _confirmLink(url) {
    console.log("Confirming link "+url);
    // e.preventDefault();
    const {editorState, urlValue} = this.state;
    const entityKey = Entity.create('LINK', 'MUTABLE', {url: url});
    this.setState({
      editorState: RichUtils.toggleLink(
        editorState,
        editorState.getSelection(),
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
    const selection = editorState.getSelection();
    console.log(JSON.stringify(selection));
    if (!selection.isCollapsed()) {
      this.setState({
        editorState: RichUtils.toggleLink(editorState, selection, null),
      });
    }
  }

  _onLinkInputKeyDown(e) {
    if (e.which === 13) {
      this._confirmLink(e);
    }
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

    let entity = this._getEntityAtCursor(editorState);
    let isCursorOnLink = (entity != null && entity.type == 'LINK');

    return (
      <div className="RichEditor-root">
        <div className="RichEditor-controls-container">
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />

          {/*<LinkButton action={this.promptForLink} label="Link" active={!editorState.getSelection().isCollapsed()} icon="link" />*/}
          {/*<LinkButton action={this.removeLink} label="Unlink" active={isCursorOnLink} icon="unlink"/>*/}
        </div>
        {this.state.showURLInput ? <UrlInput url={R.pathOr('', ['data', 'url'], entity)} confirmLink={this.confirmLink }/> : ''}
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
    let className = 'button-link RichEditor-styleButton'

    if (this.props.active) {
      className += ' button-link-is-active'
    }

    return (
      <Button
        classList={className}
        onMouseDown={this.onToggle}
        title={this.props.label}
      >
        <Icon name={this.props.icon} />
        <span className="sr-only">{this.props.label}</span>
      </Button>
    )
  }
}

class LinkButton extends React.Component {

  render(){
    let className = 'button-link RichEditor-styleButton'

    if (this.props.active) {
      className += ' button-link-is-active';
    } else{
      className += ' button-link-is-inactive';
    }

    return(
      <Button
        classList={className}
        onMouseDown={this.props.action}
        title={this.props.label}
      >
        <Icon name={this.props.icon} />
        <span className="sr-only">{this.props.label}</span>
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
    <a href={url} style={styles.link}>
      {props.children}
    </a>
  );
};

const BLOCK_TYPES = [
  {label: 'Unordered list', style: 'unordered-list-item', icon: 'list-ul'},
  {label: 'Ordered list', style: 'ordered-list-item', icon: 'list-ol'}
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

const INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD', icon: 'bold'},
  {label: 'Italic', style: 'ITALIC', icon: 'italic'},
  {label: 'Underline', style: 'UNDERLINE', icon: 'underline'}
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

const styles = {
  link: {
    color: '#3b5998',
    textDecoration: 'underline'
  },
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

  render(){
    return(
    <div>
      <input
        onChange={this.onURLChange}
        ref="url"
        autoFocus="autoFocus"
        type="text"
        value={this.state.url}
        onKeyDown={this.onURLChange}
      />
      <button onMouseDown={() => this.confirmLink(this.state.url)}>
        Confirm
      </button>
    </div>)
  }
}
