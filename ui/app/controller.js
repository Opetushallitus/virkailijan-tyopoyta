export function initController (dispatcher, events) {
  // EDITOR

  const toggleEditor = (isVisible, releaseId) => dispatcher.push(events.toggleEditor, { isVisible, releaseId })

  const toggleEditorTab = selectedTab => dispatcher.push(events.toggleEditorTab, selectedTab)

  const updateRelease = (prop, value) => dispatcher.push(events.updateRelease, {prop: prop, value: value})

  const toggleReleaseCategory = category =>
    dispatcher.push(events.toggleReleaseCategory, category)

  const updateNotification = (prop, value) => dispatcher.push(events.updateNotification, {prop: prop, value: value})

  const updateNotificationTags = value => dispatcher.push(events.updateNotificationTags, value)

  const updateNotificationContent = (lang, prop) => value =>
    dispatcher.push(events.updateNotificationContent, {lang: lang, prop: prop, value: value})

  const toggleNotification = id => dispatcher.push(events.toggleNotification, {id: id})

  const addTimelineItem = release =>
    dispatcher.push(events.addTimelineItem, release)

  const updateTimelineContent = (id, lang, prop) => value =>
    dispatcher.push(events.updateTimelineContent, {id: id, lang: lang, prop: prop, value: value})

  const updateTimeline = (id, prop, value) =>
    dispatcher.push(events.updateTimeline, {id: id, prop:prop, value:value})

  const toggleDocumentPreview = isPreviewed => dispatcher.push(events.toggleDocumentPreview, isPreviewed)

  const saveDocument = () => dispatcher.push(events.saveDocument)

  // MENU

  const toggleMenu = isVisible => dispatcher.push(events.toggleMenu, isVisible)

  // NOTIFICATIONS

  const getNotifications = page => dispatcher.push(events.getNotifications, page)

  const lazyLoadNotifications = page => dispatcher.push(events.lazyLoadNotifications, page)

  const updateSearch = search => dispatcher.push(events.updateSearch, {search: search})

  const setSelectedNotificationTags = value => {
    console.log('Tag selected', value)

    dispatcher.push(events.setSelectedNotificationTags, value)
  }

  const toggleNotificationTag = value => {
    console.log('Toggled tag with value', value)

    dispatcher.push(events.toggleNotificationTag, value)
  }

  return {
    // Editor
    toggleEditor: toggleEditor,
    toggleEditorTab: toggleEditorTab,
    updateRelease: updateRelease,
    toggleReleaseCategory: toggleReleaseCategory,
    updateNotification: updateNotification,
    updateNotificationTags: updateNotificationTags,
    updateNotificationContent: updateNotificationContent,
    addTimelineItem: addTimelineItem,
    updateTimelineContent: updateTimelineContent,
    updateTimeline: updateTimeline,
    toggleDocumentPreview: toggleDocumentPreview,
    saveDocument: saveDocument,

    // Menu
    toggleMenu: toggleMenu,

    // Notifications
    getNotifications: getNotifications,
    lazyLoadNotifications: lazyLoadNotifications,
    updateSearch: updateSearch,
    toggleNotificationTag: toggleNotificationTag,
    setSelectedNotificationTags: setSelectedNotificationTags,
    toggleNotification : toggleNotification
  }
}
