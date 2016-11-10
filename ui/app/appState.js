import Bacon from 'baconjs'
import Dispatcher from './dispatcher'
import {initController} from './controller'
import Immutable from 'seamless-immutable'
import {EditorState} from 'draft-js'
import * as testData from './resources/test/testData.json'

const dispatcher = new Dispatcher();

const events = {
  addNotification: 'addNotification',
  deleteNotification: 'deleteNotification',
  toggleEditor: 'showEdit',
  updateNotifications : 'updateNotifications',
  updateDocument : 'updateDocument',
  updateDocumentContent : 'updateDocumentContent',
  saveDocument : 'saveDocument',
  updateSearch : 'updateSearch',
  toggleNotification: 'toggleNotification'
};

const controller = initController(dispatcher, events);

export function getController(){
  return controller;
}

function updateDocument(state, {prop, value}){
  console.log(`updating document: ${prop} = ${value}`);
  return state.setIn(['editor', 'document', prop], value);
}

function updateContent(state, {prop, lang, value}){
  console.log(`updating state: editor.content.${lang}.${prop} = ${value}`);
  return state.setIn(['editor', 'document', 'content', lang,  prop], value);
}

function toggleEditor(state, visible){
  return state.setIn(['editor', 'visible'], visible);
}

function saveDocument(state){
  console.log("Saving document");
  console.log(JSON.stringify(state.editor.document));
  return state;
}

function updateSearch(state, {search}){
  return state.set('filter', search)
}

function toggleNotification(state, {id}){
  const idx = state.expandedNotifications.indexOf(id);
  if(idx >= 0){
    return state.set('expandedNotifications', state.expandedNotifications.filter(n =>( n != id)))
  }
  return state.set('expandedNotifications', state.expandedNotifications.concat(id))
}

function emptyContent(lang){
  return {
    title: "",
    text: "",
    timelineText: "",
    language: lang,
  }
}

function emptyDocument(){
  return{
    type: '',
    publishDate: null,
    expiryDate: null,
    content: {
      fi: emptyContent('fi'),
      sv: emptyContent('sv')
    },
    tags: []
  }
}

export function initAppState() {

  const initialState = Immutable({
    notifications: testData.notifications,
    expandedNotifications: [],
    filter: '',

    editor: {
      visible: false,
      document: emptyDocument()
    }});

  return Bacon.update(initialState,
    [dispatcher.stream(events.toggleEditor)], toggleEditor,
    [dispatcher.stream(events.updateDocument)], updateDocument,
    [dispatcher.stream(events.updateDocumentContent)], updateContent,
    [dispatcher.stream(events.saveDocument)], saveDocument,
    [dispatcher.stream(events.updateSearch)], updateSearch,
    [dispatcher.stream(events.toggleNotification)], toggleNotification
  )
}