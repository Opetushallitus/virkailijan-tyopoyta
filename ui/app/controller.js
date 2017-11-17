export function initController (dispatcher, events) {
  const view = {
    toggleTab: selectedTab => dispatcher.push(events.view.toggleTab, selectedTab),

    removeAlert: id => dispatcher.push(events.view.removeAlert, id)
  }

  const unpublishedNotifications = {
    open: eventTargetId => dispatcher.push(events.unpublishedNotifications.open, eventTargetId),

    close: () => dispatcher.push(events.unpublishedNotifications.close),

    edit: releaseId => dispatcher.push(events.unpublishedNotifications.edit, releaseId),

    removeAlert: id => dispatcher.push(events.unpublishedNotifications.removeAlert, id)
  }

  const notifications = {
    toggleTag: id => dispatcher.push(events.notifications.toggleTag, id),

    setSelectedTags: selected => dispatcher.push(events.notifications.setSelectedTags, selected),

    toggleCategory: id => dispatcher.push(events.notifications.toggleCategory, id),

    getPage: page => dispatcher.push(events.notifications.getPage, page),

    edit: releaseId => dispatcher.push(events.notifications.edit, releaseId),

    remove: (notification, index, value) =>
      dispatcher.push(events.notifications.remove, { notification, index, value }),

    confirmRemove: (notification, index) => dispatcher.push(events.notifications.confirmRemove, { notification, index })
  }

  const timeline = {
    getPreloadedMonth: () => dispatcher.push(events.timeline.getPreloadedMonth),

    getNextMonth: () => dispatcher.push(events.timeline.getNextMonth),

    getPreviousMonth: () => dispatcher.push(events.timeline.getPreviousMonth),

    autoFetchNextMonth: () => dispatcher.push(events.timeline.autoFetchNextMonth),

    getRelatedNotification: notificationId => dispatcher.push(events.timeline.getRelatedNotification, notificationId),

    edit: releaseId => dispatcher.push(events.timeline.edit, releaseId),

    confirmRemove: (id, nodeSelector, parentSelector) =>
      dispatcher.push(events.timeline.confirmRemove, { id, nodeSelector, parentSelector })
  }

  const editor = {
    open: (eventTargetId, releaseId, selectedTab) =>
      dispatcher.push(events.editor.open, eventTargetId, releaseId, selectedTab),

    close: (releaseId, selectedTab) => dispatcher.push(events.editor.close, releaseId, selectedTab),

    editDraft: eventTargetId => dispatcher.push(events.editor.editDraft, eventTargetId),

    toggleTab: selectedTab => dispatcher.push(events.editor.toggleTab, selectedTab),

    togglePreview: isPreviewed => dispatcher.push(events.editor.togglePreview, isPreviewed),

    toggleHasSaveFailed: () => dispatcher.push(events.editor.toggleHasSaveFailed),

    removeAlert: id => dispatcher.push(events.editor.removeAlert, id),

    save: id => dispatcher.push(events.editor.save, id),

    saveDraft: () => dispatcher.push(events.editor.saveDraft),

    targeting: {
      update: (prop, value) => dispatcher.push(events.editor.targeting.update, { prop, value }),

      removeTargetingGroup: id => dispatcher.push(events.editor.targeting.removeTargetingGroup, id),

      toggleTargetingGroup: id => dispatcher.push(events.editor.targeting.toggleTargetingGroup, id),

      toggleCategory: id => dispatcher.push(events.editor.targeting.toggleCategory, id),

      toggleUserGroup: id => dispatcher.push(events.editor.targeting.toggleUserGroup, id),

      toggleTag: id => dispatcher.push(events.editor.targeting.toggleTag, id),

      toggleSendEmail: value => dispatcher.push(events.editor.targeting.toggleSendEmail, value)
    },

    editTimeline: {
      updateItem: (id, prop, value) => dispatcher.push(events.editor.editTimeline.updateItem, { id, prop, value }),

      updateContent: (id, language, prop) => value =>
        dispatcher.push(events.editor.editTimeline.updateContent, { id, language, prop, value }),

      add: (releaseId, timeline) => dispatcher.push(events.editor.editTimeline.add, { releaseId, timeline }),

      remove: id => dispatcher.push(events.editor.editTimeline.remove, id)
    },

    editNotification: {
      update: (prop, value) => dispatcher.push(events.editor.editNotification.update, { prop, value }),

      updateContent: (language, prop) => value =>
        dispatcher.push(events.editor.editNotification.updateContent, { language, prop, value }),

      setAsDisruptionNotification: id => dispatcher.push(events.editor.targeting.toggleTag, id)
    }
  }

  const user = {
    saveSendEmail: value => dispatcher.push(events.user.saveSendEmail, value)
  }

  return {
    view: {
      toggleTab: view.toggleTab,
      removeAlert: view.removeAlert
    },

    unpublishedNotifications: {
      open: unpublishedNotifications.open,
      close: unpublishedNotifications.close,
      edit: unpublishedNotifications.edit,
      removeAlert: unpublishedNotifications.removeAlert
    },

    notifications: {
      toggleTag: notifications.toggleTag,
      setSelectedTags: notifications.setSelectedTags,
      toggleCategory: notifications.toggleCategory,
      getPage: notifications.getPage,
      edit: notifications.edit,
      remove: notifications.remove,
      confirmRemove: notifications.confirmRemove
    },

    timeline: {
      getPreloadedMonth: timeline.getPreloadedMonth,
      getNextMonth: timeline.getNextMonth,
      getPreviousMonth: timeline.getPreviousMonth,
      autoFetchNextMonth: timeline.autoFetchNextMonth,
      getRelatedNotification: timeline.getRelatedNotification,
      edit: timeline.edit,
      confirmRemove: timeline.confirmRemove
    },

    editor: {
      open: editor.open,
      close: editor.close,
      editDraft: editor.editDraft,
      toggleTab: editor.toggleTab,
      togglePreview: editor.togglePreview,
      toggleHasSaveFailed: editor.toggleHasSaveFailed,
      removeAlert: editor.removeAlert,
      save: editor.save,
      saveDraft: editor.saveDraft,
      targeting: {
        update: editor.targeting.update,
        toggleTargetingGroup: editor.targeting.toggleTargetingGroup,
        removeTargetingGroup: editor.targeting.removeTargetingGroup,
        toggleCategory: editor.targeting.toggleCategory,
        toggleUserGroup: editor.targeting.toggleUserGroup,
        toggleTag: editor.targeting.toggleTag,
        toggleSendEmail: editor.targeting.toggleSendEmail
      },
      editTimeline: {
        updateItem: editor.editTimeline.updateItem,
        updateContent: editor.editTimeline.updateContent,
        add: editor.editTimeline.add,
        remove: editor.editTimeline.remove
      },
      editNotification: {
        update: editor.editNotification.update,
        updateContent: editor.editNotification.updateContent,
        setAsDisruptionNotification: editor.editNotification.setAsDisruptionNotification
      }
    },

    user: {
      saveSendEmail: user.saveSendEmail
    }
  }
}
