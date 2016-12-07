import Bacon from 'baconjs'
import Dispatcher from './dispatcher'
import {initController} from './controller'
import {EditorState} from 'draft-js'
import * as testData from './resources/test/testData.json'
import R from 'ramda'

const dispatcher = new Dispatcher();

const events = {
  addNotification: 'addNotification',
  deleteNotification: 'deleteNotification',
  toggleEditor: 'showEdit',
  updateNotification : 'updateNotification',
  updateNotificationContent : 'updateDocumentContent',
  updateTimeline : 'updateTimeline',
  updateTimelineContent : 'updateTimelineContent',
  saveDocument : 'saveDocument',
  updateSearch : 'updateSearch',
  toggleNotification: 'toggleNotification',
  toggleEditorCategory : 'toggleEditorCategory'
};

const notificationsUrl = "http://localhost:9000/virkailijan-tyopoyta";

const controller = initController(dispatcher, events);

export function getController(){
  return controller;
}

function updateRelease(state, {prop, value}){
  return R.assoc(['editor', 'document', prop], value, state);
}

function updateNotification(state, {prop, value}){
  return R.assocPath(['editor', 'document', 'notification', prop], value, state)
}

function updateNotificationContent(state, {prop, lang, value}){
  return R.assocPath(['editor', 'document', 'notification', 'content', lang,  prop], value, state);
}

function toggleEditorCategory(state, {category, selected}){
  console.log("Select category "+category+" : "+selected);
  const categories = state.editor.document.categories;
  const newCategories =  R.contains(category, categories) ?
    R.reject((c => c === category), categories) :
    R.append(category, categories);

  return R.assocPath(['editor', 'document', 'categories'], newCategories, state);
}

function updateTimeline(state, {id, prop, value}){
  console.log("Updating timeline item "+id);
  const timeline = state.editor.document.timeline;
  const idx = R.findIndex(R.propEq('id', id), timeline);
  const newTimeline = R.adjust(R.assoc(prop, value), idx, timeline);
  console.log("new timeline:"+ newTimeline);

  return R.assocPath(['editor', 'document', 'timeline'], newTimeline, state);
}

function updateTimelineContent(state, {id, lang, prop, value}){
  const timeline = state.editor.document.timeline;
  const idx = R.findIndex(R.propEq('id', id), timeline);
  const newTimeline = R.adjust(R.assocPath(['content', lang, prop], value), idx, timeline);
  return R.assocPath(['editor', 'document', 'timeline'], newTimeline, state);
}

function toggleEditor(state, visible){
  return R.assocPath(['editor', 'visible'], visible, state);
}

function saveDocument(state){
  console.log("Saving document");
  console.log(JSON.stringify(state.editor.document));

  fetch(notificationsUrl+"/addRelease", {
    method: 'POST',
    dataType: 'json',
    headers: {
      "Content-type": "text/json; charset=UTF-8"
    },
    body: JSON.stringify(state.editor.document),
  });

  return state;
}

function updateSearch(state, {search}){
  return R.assoc('filter', search, state)
}

function toggleNotification(state, {id}){
  const idx = state.expandedNotifications.indexOf(id);
  if(idx >= 0){
    return R.assoc('expandedNotifications', state.expandedNotifications.filter(n =>( n != id)), state)
  }
  return R.assoc('expandedNotifications', state.expandedNotifications.concat(id), state)
}

function emptyContent(id ,lang){
  return {
    notificationId: id,
    text: "",
    title: "",
    language: lang,
  }
}

function emptyNotification(){
  return{
    id: -1,
    releaseId: -1,
    publishDate: null,
    expiryDate: null,
    content: {
      fi: emptyContent(-1, 'fi'),
      sv: emptyContent(-1, 'sv')
    },
    tags: []
  }
}

const newTimelineId = R.compose(R.dec, R.apply(Math.min), R.map(R.prop('id')));

function newTimelineItem(releaseId, timeline){
  const id = Math.min(newTimelineId(timeline), 0);
  return{
    id: id,
    releaseId: releaseId,
    date: null,
    content: {
      fi: {timelineId: id, language: 'fi', text: ''},
      sv: {timelineId: id, language: 'sv', text: ''}
    }
  }
}

function emptyRelease(){
  return {
    id: -1,
    sendEmail: false,
    notification: emptyNotification(),
    timeline: [newTimelineItem(-1, [])],
    categories: []
  }
}

function onReleasesReceived(state, response){
  console.log("received releases: "+JSON.stringify(response) );
  return R.assoc('releases', response, state)
}

function onNotificationsReceived(state, response){
  console.log("received notifications: "+JSON.stringify(response) );
  return R.assoc('notifications', response, state)
}

function onTimelineReceived(state, response){
  console.log("received timeline: "+JSON.stringify(response) );
  return R.assoc('timeline', response, state)
}

export function initAppState() {

  // const releasesS = Bacon.fromPromise(fetch(notificationsUrl).then(resp => resp.json()));
  const releasesS = Bacon.fromArray(testData.releases)
  const notificationsS = releasesS.flatMapLatest(r => R.map(r => r.notification, r));
  const timelineS = releasesS.flatMapLatest(r => R.map(r => r.timeline, r));

  const initialState = {
    releases: testData.releases,
    notifications: testData.releases.map(r => r.notification),
    timeline: R.chain(r => r.timeline, testData.releases),
    expandedNotifications: [],
    activeFilter: '',
    editor: {
      visible: false,
      document: emptyRelease()
    }};

  return Bacon.update(initialState,
    [dispatcher.stream(events.toggleEditor)], toggleEditor,
    [dispatcher.stream(events.updateNotification)], updateNotification,
    [dispatcher.stream(events.updateNotificationContent)], updateNotificationContent,
    [dispatcher.stream(events.saveDocument)], saveDocument,
    [dispatcher.stream(events.updateSearch)], updateSearch,
    [dispatcher.stream(events.toggleNotification)], toggleNotification,
    [dispatcher.stream(events.updateTimeline)], updateTimeline,
    [dispatcher.stream(events.updateTimelineContent)], updateTimelineContent,
    [dispatcher.stream(events.toggleEditorCategory)], toggleEditorCategory,
    [releasesS], onReleasesReceived,
    [notificationsS], onNotificationsReceived,
    [timelineS], onTimelineReceived
  )
}