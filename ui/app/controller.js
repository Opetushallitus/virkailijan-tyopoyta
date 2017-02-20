export function initController (dispatcher, events) {
  const view = {
    toggleCategory: category => dispatcher.push(events.view.toggleCategory, category),

    toggleTab: selectedTab => dispatcher.push(events.view.toggleTab, selectedTab),

    toggleMenu: () => dispatcher.push(events.view.toggleMenu),

    removeAlert: id => dispatcher.push(events.view.removeAlert, id)
  }

  const tags = {
    toggle: id => dispatcher.push(events.tags.toggle, id),

    setSelectedItems: selected => dispatcher.push(events.tags.setSelectedItems, selected)
  }

  const notifications = {
    getPage: page => dispatcher.push(events.notifications.getPage, page),

    edit: releaseId => dispatcher.push(events.notifications.edit, releaseId),

    toggleUnpublishedNotifications: releaseId => dispatcher.push(events.notifications.toggleUnpublishedNotifications(), releaseId)
  }

  const timeline = {
    getPreloadedMonth: () => dispatcher.push(events.timeline.getPreloadedMonth),

    getNextMonth: (year, month) => dispatcher.push(events.timeline.getNextMonth, { year, month }),

    getPreviousMonth: (year, month) => dispatcher.push(events.timeline.getPreviousMonth, { year, month }),

    edit: releaseId => dispatcher.push(events.timeline.edit, releaseId)
  }

  const editor = {
    toggle: (releaseId, selectedTab) => dispatcher.push(events.editor.toggle, releaseId, selectedTab),

    toggleTab: selectedTab => dispatcher.push(events.editor.toggleTab, selectedTab),

    togglePreview: isPreviewed => dispatcher.push(events.editor.togglePreview, isPreviewed),

    toggleHasSaveFailed: () => dispatcher.push(events.editor.toggleHasSaveFailed),

    removeAlert: id => dispatcher.push(events.editor.removeAlert, id),

    save: () => dispatcher.push(events.editor.save),

    editRelease: {
      toggleCategory: category => dispatcher.push(events.editor.editRelease.toggleCategory, category),

      toggleUserGroup: value => dispatcher.push(events.editor.editRelease.toggleUserGroup, value),

      updateFocusedCategory: value => dispatcher.push(events.editor.editRelease.updateFocusedCategory, value),

      toggleFocusedUserGroup: value => dispatcher.push(events.editor.editRelease.toggleFocusedUserGroup, value)
    },

    editTimeline: {
      update: (id, prop, value) => dispatcher.push(events.editor.editTimeline.update, { id, prop, value }),

      updateContent: (id, language, prop) => value =>
        dispatcher.push(events.editor.editTimeline.updateContent, { id, language, prop, value }),

      add: release => dispatcher.push(events.editor.editTimeline.add, release),

      remove: id => dispatcher.push(events.editor.editTimeline.remove, id)
    },

    editNotification: {
      update: (prop, value) => dispatcher.push(events.editor.editNotification.update, { prop, value }),

      toggleTag: id => dispatcher.push(events.editor.editNotification.toggleTag, id),

      setSelectedTags: selected => dispatcher.push(events.editor.editNotification.setSelectedTags, selected),

      updateContent: (language, prop) => value =>
        dispatcher.push(events.editor.editNotification.updateContent, { language, prop, value })
    }
  }

  return {
    // View
    view: {
      update: view.update,
      toggleCategory: view.toggleCategory,
      toggleTab: view.toggleTab,
      removeAlert: view.removeAlert,
      toggleMenu: view.toggleMenu
    },

    tags: {
      toggle: tags.toggle,
      setSelectedItems: tags.setSelectedItems
    },

    notifications: {
      getPage: notifications.getPage,
      toggle: notifications.toggle,
      edit: notifications.edit,
      toggleUnpublishedNotifications: notifications.toggleUnpublishedNotifications
    },

    timeline: {
      getPreloadedMonth: timeline.getPreloadedMonth,
      getNextMonth: timeline.getNextMonth,
      getPreviousMonth: timeline.getPreviousMonth,
      edit: timeline.edit
    },

    editor: {
      toggle: editor.toggle,
      toggleTab: editor.toggleTab,
      togglePreview: editor.togglePreview,
      toggleHasSaveFailed: editor.toggleHasSaveFailed,
      removeAlert: editor.removeAlert,
      save: editor.save,
      editRelease: {
        toggleCategory: editor.editRelease.toggleCategory,
        toggleUserGroup: editor.editRelease.toggleUserGroup,
        updateFocusedCategory: editor.editRelease.updateFocusedCategory,
        toggleFocusedUserGroup: editor.editRelease.toggleFocusedUserGroup
      },
      editTimeline: {
        update: editor.editTimeline.update,
        updateContent: editor.editTimeline.updateContent,
        add: editor.editTimeline.add,
        remove: editor.editTimeline.remove
      },
      editNotification: {
        update: editor.editNotification.update,
        toggleTag: editor.editNotification.toggleTag,
        setSelectedTags: editor.editNotification.setSelectedTags,
        updateContent: editor.editNotification.updateContent
      }
    }
  }
}
