import React from 'react'
import fp from 'lodash/fp'
import {Editor, EditorState, RichUtils, CompositeDecorator, ContentState, Entity} from 'draft-js';
import {getEntityAtCursor} from './getEntityAtCursor';
import {convertToHTML} from 'draft-convert';

const _ = fp();
// import _ from 'lodash';

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
      editorState: EditorState.createEmpty(decorator),
      showURLInput: false};

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
        <div className="RichEditor-controls">
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />

          <LinkButton action={this.promptForLink} label="Link" active={!editorState.getSelection().isCollapsed()} className="icon-link" />
          <LinkButton action={this.removeLink} label="Unlink" active={isCursorOnLink} className="icon-unlink"/>
        </div>
        {this.state.showURLInput ? <UrlInput url={_.get(entity, 'data.url', '')} confirmLink={this.confirmLink }/> : ''}
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
    let className = this.props.className ;
    className += ' RichEditor-styleButton'
    if (this.props.active) {
      className += ' style-active';
    }
    return (
      <span className={className} onMouseDown={this.onToggle}/>
    );
  }
}

class LinkButton extends React.Component {

  render(){
    let className = this.props.className;
    className += ' RichEditor-styleButton link';

    if (this.props.active) {
      className += ' link-active';
    } else{
      className += ' link-inactive';
    }

    return(
      <span className={className} onMouseDown={this.props.action}/>
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
  {label: 'Header', style: 'header-two', className: 'icon-header'},
  {label: 'UL', style: 'unordered-list-item', className: 'icon-list-ul'},
  {label: 'OL', style: 'ordered-list-item', className: 'icon-list-ol'}
];

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
          className={type.className}
        />
      )}
    </div>
  );
};

var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD', className: 'icon-bold'},
  {label: 'Italic', style: 'ITALIC', className: 'icon-italic'},
  {label: 'Underline', style: 'UNDERLINE', className: 'icon-underline'}
];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
          className={type.className}
        />
      )}
    </div>
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
