export function initController (dispatcher, events) {
  const view = {
    update: (prop, value) => dispatcher.push(events.view.update, { prop: prop, value: value }),

    toggleCategory: category => dispatcher.push(events.view.toggleCategory, category),

    toggleTab: selectedTab => dispatcher.push(events.view.toggleTab, selectedTab),

    toggleMenu: () => dispatcher.push(events.view.toggleMenu),

    removeAlert: id => dispatcher.push(events.view.removeAlert, id)
  }

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

  const toggleNotification = id => dispatcher.push(events.toggleNotification, id)

  const addTimelineItem = release => dispatcher.push(events.addTimelineItem, release)

  const removeTimelineItem = id => dispatcher.push(events.removeTimelineItem, id)

  const updateTimelineContent = (id, lang, prop) => value =>
    dispatcher.push(events.updateTimelineContent, {id: id, lang: lang, prop: prop, value: value})

  const updateTimeline = (id, prop, value) =>
    dispatcher.push(events.updateTimeline, {id: id, prop: prop, value: value})

  const toggleDocumentPreview = isPreviewed => dispatcher.push(events.toggleDocumentPreview, isPreviewed)

  const toggleHasSaveFailed = () => dispatcher.push(events.toggleHasSaveFailed)

  const saveDocument = () => dispatcher.push(events.saveDocument)

  // MENU


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

  // TIMELINE

  const getPreloadedMonth = () => dispatcher.push(events.getPreloadedMonth)

  const getPreviousMonth = (year, month) => dispatcher.push(events.getPreviousMonth, {year: year, month: month})

  const getNextMonth = (year, month) => dispatcher.push(events.getNextMonth, {year: year, month: month})

  return {
    // View
    view: {
      update: view.update,
      toggleCategory: view.toggleCategory,
      toggleTab: view.toggleTab,
      removeAlert: view.removeAlert,
      toggleMenu: view.toggleMenu
    },

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
    toggleHasSaveFailed: toggleHasSaveFailed,
    saveDocument: saveDocument,

    // Notifications
    getNotifications: getNotifications,
    toggleUnpublishedNotifications: toggleUnpublishedNotifications,
    lazyLoadNotifications: lazyLoadNotifications,
    updateSearch: updateSearch,
    toggleNotificationTag: toggleNotificationTag,
    setSelectedNotificationTags: setSelectedNotificationTags,
    toggleNotification: toggleNotification,

    // Timeline
    getPreloadedMonth: getPreloadedMonth,
    getPreviousMonth: getPreviousMonth,
    getNextMonth: getNextMonth
  }
}
