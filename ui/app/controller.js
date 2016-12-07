export function initController(dispatcher, events){

  function togleEditor(visible){
    dispatcher.push(events.toggleEditor, visible);
  }

  const updateNotification = prop => value => dispatcher.push(events.updateNotification, {prop: prop, value: value});

  const  updateNotificationContent = (lang, prop) => value => dispatcher.push(events.updateNotificationContent, {lang: lang, prop: prop, value: value});

  const updateSearch = search => dispatcher.push(events.updateSearch, {search: search});

  const saveDocument = () => dispatcher.push(events.saveDocument);

  const toggleNotification = id => dispatcher.push(events.toggleNotification, {id: id});

  const updateTimelineContent = (id, lang, prop) => value =>
    dispatcher.push(events.updateTimelineContent, {id: id, lang: lang, prop: prop, value: value});

  const updateTimeline = (id, prop) => value =>
    dispatcher.push(events.updateTimeline, {id: id, prop:prop, value:value});

  const updateRelease = prop => value => dispatcher.push(events.updateRelease, {prop: prop, value: value});

  const toggleEditorCategory = (category, selected) =>
    dispatcher.push(events.toggleEditorCategory, {category: category, selected: selected});

  return {
    toggleEditor: togleEditor,
    updateNotification: updateNotification,
    updateNotificationContent: updateNotificationContent,
    saveDocument: saveDocument,
    updateSearch: updateSearch,
    toggleNotification : toggleNotification,
    updateTimelineContent : updateTimelineContent,
    updateTimeline : updateTimeline,
    updateRelease : updateRelease,
    toggleEditorCategory : toggleEditorCategory
  }
}