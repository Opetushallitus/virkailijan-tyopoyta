export function initController (dispatcher, events) {
  const view = {
    toggleCategory: category => dispatcher.push(events.view.toggleCategory, category),

    setSelectedCategories: selected => { dispatcher.push(events.view.setSelectedCategories, selected) },

    toggleTab: selectedTab => dispatcher.push(events.view.toggleTab, selectedTab),

    toggleMenu: () => dispatcher.push(events.view.toggleMenu),

    removeAlert: id => dispatcher.push(events.view.removeAlert, id)
  }

  const unpublishedNotifications = {
    toggle: () => dispatcher.push(events.unpublishedNotifications.toggle),

    edit: releaseId => dispatcher.push(events.unpublishedNotifications.edit, releaseId),

    removeAlert: id => dispatcher.push(events.unpublishedNotifications.removeAlert, id)
  }

  const notifications = {
    toggleTag: id => dispatcher.push(events.notifications.toggleTag, id),

    setSelectedTags: selected => dispatcher.push(events.notifications.setSelectedTags, selected),

    getPage: page => dispatcher.push(events.notifications.getPage, page),

    toggle: id => dispatcher.push(events.notifications.toggle, id),

    edit: releaseId => dispatcher.push(events.notifications.edit, releaseId)
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

    save: id => dispatcher.push(events.editor.save, id),

    saveDraft: () => dispatcher.push(events.editor.saveDraft),

    targeting: {
      update: (prop, value) => dispatcher.push(events.editor.targeting.update, { prop, value }),

      toggleCategory: id => dispatcher.push(events.editor.targeting.toggleCategory, id),

      toggleUserGroup: id => dispatcher.push(events.editor.targeting.toggleUserGroup, id),

      toggleTag: id => dispatcher.push(events.editor.targeting.toggleTag, id)
    },

    editTimeline: {
      update: (id, prop, value) => dispatcher.push(events.editor.editTimeline.update, { id, prop, value }),

      updateContent: (id, language, prop) => value =>
        dispatcher.push(events.editor.editTimeline.updateContent, { id, language, prop, value }),

      add: (releaseId, timeline) => dispatcher.push(events.editor.editTimeline.add, { id: releaseId, timeline }),

      remove: id => dispatcher.push(events.editor.editTimeline.remove, id)
    },

    editNotification: {
      update: (prop, value) => dispatcher.push(events.editor.editNotification.update, { prop, value }),

      updateContent: (language, prop) => value =>
        dispatcher.push(events.editor.editNotification.updateContent, { language, prop, value })
    }
  }

  return {
    // View
    view: {
      toggleCategory: view.toggleCategory,
      setSelectedCategories: view.setSelectedCategories,
      toggleTab: view.toggleTab,
      removeAlert: view.removeAlert,
      toggleMenu: view.toggleMenu
    },

    unpublishedNotifications: {
      toggle: unpublishedNotifications.toggle,
      edit: unpublishedNotifications.edit,
      removeAlert: unpublishedNotifications.removeAlert
    },

    notifications: {
      toggleTag: notifications.toggleTag,
      setSelectedTags: notifications.setSelectedTags,
      getPage: notifications.getPage,
      toggle: notifications.toggle,
      edit: notifications.edit
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
      saveDraft: editor.saveDraft,
      targeting: {
        update: editor.targeting.update,
        toggleCategory: editor.targeting.toggleCategory,
        toggleUserGroup: editor.targeting.toggleUserGroup,
        toggleTag: editor.targeting.toggleTag
      },
      editTimeline: {
        update: editor.editTimeline.update,
        updateContent: editor.editTimeline.updateContent,
        add: editor.editTimeline.add,
        remove: editor.editTimeline.remove
      },
      editNotification: {
        update: editor.editNotification.update,
        updateContent: editor.editNotification.updateContent
      }
    }
  }
}
