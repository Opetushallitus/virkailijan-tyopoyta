export function initController(dispatcher, events){

  function togleEditor(visible){
    dispatcher.push(events.toggleEditor, visible);
  }

  function updateDocument(prop){
    return (value ) => dispatcher.push(events.updateDocument, {prop: prop, value: value})
  }

  function updateContent(lang, prop){
    return (value) => dispatcher.push(events.updateDocumentContent, {lang: lang, prop: prop, value: value})
  }

  function updateSearch(search){
    dispatcher.push(events.updateSearch, {search: search})
  }

  function saveDocument(){
    console.log("DOCUMENT SAVED")
  }

  function toggleNotification(id){
    dispatcher.push(events.toggleNotification, {id: id})
  }

  return {
    toggleEditor: togleEditor,
    updateDocument: updateDocument,
    updateDocumentContent: updateContent,
    saveDocument: saveDocument,
    updateSearch: updateSearch,
    toggleNotification : toggleNotification
  }
}