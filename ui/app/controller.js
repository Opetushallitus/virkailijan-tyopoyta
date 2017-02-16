export function initController (dispatcher, events) {
  const view = {
    toggleCategory: category => dispatcher.push(events.view.toggleCategory, category),

    toggleTab: selectedTab => dispatcher.push(events.view.toggleTab, selectedTab),

    toggleMenu: () => dispatcher.push(events.view.toggleMenu),

    removeAlert: id => dispatcher.push(events.view.removeAlert, id)
  }

  const timeline = {
    getPreloadedMonth: () => dispatcher.push(events.timeline.getPreloadedMonth),

    getPreviousMonth: (year, month) => dispatcher.push(events.timeline.getPreviousMonth, { year, month }),

    getNextMonth: (year, month) => dispatcher.push(events.timeline.getNextMonth, { year, month }),

    edit: releaseId => dispatcher.push(events.timeline.edit, releaseId)
  }

  const notifications = {
    getPage: page => dispatcher.push(events.notifications.getPage, page),

    toggleTag: value => dispatcher.push(events.notifications.toggleTag, value),

    setSelectedTags: value => dispatcher.push(events.notifications.setSelectedTags, value),

    toggle: id => dispatcher.push(events.notifications.toggle, id),

    edit: releaseId => dispatcher.push(events.notifications.edit, releaseId),

    toggleUnpublishedNotifications: releaseId => dispatcher.push(events.notifications.toggleUnpublishedNotifications(), releaseId)
  }

  const editor = {
    toggle: (releaseId, selectedTab) => dispatcher.push(events.editor.toggle, releaseId, selectedTab),

    toggleTab: selectedTab => dispatcher.push(events.editor.toggleTab, selectedTab),

    togglePreview: isPreviewed => dispatcher.push(events.editor.togglePreview, isPreviewed),

    toggleHasSaveFailed: () => dispatcher.push(events.editor.toggleHasSaveFailed),

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

      updateTags: value => dispatcher.push(events.editor.editNotification.updateTags, value),

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

    timeline: {
      getPreloadedMonth: timeline.getPreloadedMonth,
      getNextMonth: timeline.getNextMonth,
      getPreviousMonth: timeline.getPreviousMonth,
      edit: timeline.edit
    },

    notifications: {
      getPage: notifications.getPage,
      toggleTag: notifications.toggleTag,
      setSelectedTags: notifications.setSelectedTags,
      toggle: notifications.toggle,
      edit: notifications.edit,
      toggleUnpublishedNotifications: notifications.toggleUnpublishedNotifications
    },

    editor: {
      toggle: editor.toggle,
      toggleTab: editor.toggleTab,
      togglePreview: editor.togglePreview,
      toggleHasSaveFailed: editor.toggleHasSaveFailed,
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
        updateTags: editor.editNotification.updateTags,
        updateContent: editor.editNotification.updateContent
      }
    }
  }
}
