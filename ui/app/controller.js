export function initController (dispatcher, events) {
  // VIEW

  const updateView = (prop, value) => dispatcher.push(events.updateView, { prop: prop, value: value })

  const toggleViewCategory = category => dispatcher.push(events.toggleViewCategory, category)

  const toggleViewTab = selectedTab => dispatcher.push(events.toggleViewTab, selectedTab)

  const removeViewAlert = id => dispatcher.push(events.removeViewAlert, id)

  // EDITOR

  const toggleEditor = (releaseId, selectedTab) =>
    dispatcher.push(events.toggleEditor, releaseId, selectedTab)

  const toggleEditorTab = selectedTab => dispatcher.push(events.toggleEditorTab, selectedTab)

  const updateRelease = (prop, value) => dispatcher.push(events.updateRelease, {prop: prop, value: value})

  const toggleReleaseCategory = category => dispatcher.push(events.toggleReleaseCategory, category)

  const toggleReleaseUserGroup = value => dispatcher.push(events.toggleReleaseUserGroup, value)

  const updateFocusedReleaseCategory = value => dispatcher.push(events.updateFocusedReleaseCategory, value)

  const toggleFocusedReleaseUserGroup = value => dispatcher.push(events.toggleFocusedReleaseUserGroup, value)

  const updateNotification = (prop, value) => dispatcher.push(events.updateNotification, {prop: prop, value: value})

  const updateNotificationTags = value => dispatcher.push(events.updateNotificationTags, value)

  const updateNotificationContent = (lang, prop) => value =>
    dispatcher.push(events.updateNotificationContent, {lang: lang, prop: prop, value: value})

  const toggleNotification = id => dispatcher.push(events.toggleNotification, {id: id})

  const addTimelineItem = release => dispatcher.push(events.addTimelineItem, release)

  const removeTimelineItem = id => dispatcher.push(events.removeTimelineItem, id)

  const updateTimelineContent = (id, lang, prop) => value =>
    dispatcher.push(events.updateTimelineContent, {id: id, lang: lang, prop: prop, value: value})

  const updateTimeline = (id, prop, value) =>
    dispatcher.push(events.updateTimeline, {id: id, prop: prop, value: value})

  const toggleDocumentPreview = isPreviewed => dispatcher.push(events.toggleDocumentPreview, isPreviewed)

  const saveDocument = () => dispatcher.push(events.saveDocument)

  // MENU

  const toggleMenu = () => dispatcher.push(events.toggleMenu)

  // NOTIFICATIONS

  const toggleUnpublishedNotifications = releaseId => dispatcher.push(events.toggleUnpublishedNotifications, releaseId)

  const getNotifications = page => dispatcher.push(events.getNotifications, page)

  const lazyLoadNotifications = page => dispatcher.push(events.lazyLoadNotifications, page)

  const updateSearch = search => dispatcher.push(events.updateSearch, {search: search})

  const setSelectedNotificationTags = value => {
    dispatcher.push(events.setSelectedNotificationTags, value)
  }

  const toggleNotificationTag = value => {
    dispatcher.push(events.toggleNotificationTag, value)
  }

  return {
    // View
    updateView: updateView,
    toggleViewCategory: toggleViewCategory,
    toggleViewTab: toggleViewTab,
    removeViewAlert: removeViewAlert,

    // Editor
    toggleEditor: toggleEditor,
    toggleEditorTab: toggleEditorTab,
    updateRelease: updateRelease,
    toggleReleaseCategory: toggleReleaseCategory,
    toggleReleaseUserGroup: toggleReleaseUserGroup,
    updateFocusedReleaseCategory: updateFocusedReleaseCategory,
    toggleFocusedReleaseUserGroup: toggleFocusedReleaseUserGroup,
    updateNotification: updateNotification,
    updateNotificationTags: updateNotificationTags,
    updateNotificationContent: updateNotificationContent,
    addTimelineItem: addTimelineItem,
    removeTimelineItem: removeTimelineItem,
    updateTimelineContent: updateTimelineContent,
    updateTimeline: updateTimeline,
    toggleDocumentPreview: toggleDocumentPreview,
    saveDocument: saveDocument,

    // Menu
    toggleMenu: toggleMenu,

    // Notifications
    getNotifications: getNotifications,
    toggleUnpublishedNotifications: toggleUnpublishedNotifications,
    lazyLoadNotifications: lazyLoadNotifications,
    updateSearch: updateSearch,
    toggleNotificationTag: toggleNotificationTag,
    setSelectedNotificationTags: setSelectedNotificationTags,
    toggleNotification: toggleNotification
  }
}
