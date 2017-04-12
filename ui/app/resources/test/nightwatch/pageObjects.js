const id = require('./config').id

module.exports = {
  commands: [require('./commands')],
  elements: {
    loginAlert: id('login-alert'),
    container: id('container')
  },
  sections: {
    alerts: {
      selector: id('alert-container'),
      elements: {
        alert: '.oph-alert:first-child'
      }
    },
    editor: {
      selector: id('modal-editor'),
      sections: {
        editNotification: {
          selector: id('tab-edit-notification'),
          elements: {
            title: `${id('notification-title-fi')} .oph-input`,
            descriptionTextEditor: `${id(`notification-description-fi`)} .RichEditor-editor`,
            descriptionText: `${id(`notification-description-fi`)} .RichEditor-editor [data-text]`,
            descriptionLink: `${id(`notification-description-fi`)} .public-DraftStyleDefault-block a`,
            formatButton: `${id(`notification-description-fi`)} .oph-button-icon:first-child`,
            addLinkButton: `${id(`notification-description-fi`)} ${id('RichEditor-edit-link-button')}`,
            removeLinkButton: `${id(`notification-description-fi`)} ${id('RichEditor-remove-link-button')}`,
            editLink: `${id(`notification-description-fi`)} ${id('edit-link')}`,
            linkInput: `${id(`notification-description-fi`)} ${id('notification-url')} .oph-input`,
            saveLinkButton: `${id(`notification-description-fi`)} ${id('save-link-button')}`,
            startDate: `${id('notification-start-date')} .oph-input`,
            endDate: `${id('notification-end-date')} .oph-input`
          }
        },
        editTimeline: {
          selector: id('tab-edit-timeline'),
          elements: {
            textEditor: '[data-selenium-id$="text-fi"] .RichEditor-editor',
            text: '[data-selenium-id$="text-fi"] .RichEditor-editor [data-text]',
            dateContainer: id('timeline-item-1-date'),
            date: `${id('timeline-item-1-date')} .oph-input`,
            addItemButton: id('add-timeline-item-button'),
            newItemText: id('timeline-item-2-text-fi'),
            newItemRemoveButton: id('timeline-item-2-remove-button')
          }
        },
        targeting: {
          selector: id('tab-targeting'),
          elements: {
            categoryLabel: `${id('release-category')} .oph-checkable:first-child`,
            categoryCheckbox: `${id('release-category')} .oph-checkable-input:first-child`,
            userGroupDropdown: `${id('release-usergroups-search')} .dropdown`,
            userGroupItem: `${id('release-usergroups-search')} .item:last-child`,
            userGroupButton: `${id('release-selected-user-groups')} .oph-button`,
            tagButton: `${id('notification-tag-groups')} .oph-checkbox-button:first-child`,
            tagCheckbox: `${id('notification-tag-groups')} .oph-checkbox-button-input:first-child`,
            targetingName: id('targeting-name')
          }
        }
      },
      elements: {
        preview: id('editor-preview'),
        submit: 'button[type="submit"]'
      }
    },
    unpublishedNotifications: {
      selector: id('modal-unpublished-notifications'),
      elements: {
        title: `${id('unpublished-notification')}:last-of-type ${id('unpublished-notification-title')}`
      }
    },
    menu: {
      selector: id('notifications-menu'),
      elements: {
        editDraftButton: id('edit-draft-button')
      }
    },
    notifications: {
      selector: id('notifications'),
      sections: {
        tagGroups: {
          selector: id('notification-tag-groups'),
          elements: {
            dropdown: id('notification-tag-select'),
            tagItem: `${id('notification-tag-select')} .item:first-child`,
            tagLabel: `${id('notification-tag-select')} .label`
          }
        },
        categories: {
          selector: id('notification-categories'),
          elements: {
            toggleButton: id('notification-categories-collapse-button'),
            collapse: id('notification-categories-collapse'),
            title: id('notification-categories-collapse-title'),
            categoryLabel: '.oph-checkable',
            categoryCheckbox: '.oph-checkable-input',
            categoryText: '.oph-checkable-text'
          }
        },
        notification: {
          selector: '.notification-container',
          elements: {
            editButton: '[data-selenium-id$="edit-button"]',
            removeButton: '[data-selenium-id$="remove-button"]',
            closeButton: '.oph-button-close',
            confirmRemovePopup: '.oph-popup',
            confirmRemoveButton: '.oph-button-confirm',
            heading: '.notification-heading',
            content: '.notification-content',
            category: '.tag-category',
            tag: '.tag'
          }
        }
      }
    },
    timeline: {
      selector: id('timeline'),
      sections: {
        timelineItem: {
          selector: '.timeline-item-container:first-child',
          elements: {
            editButton: '[data-selenium-id$="edit-button"]',
            removeButton: '[data-selenium-id$="remove-button"]',
            confirmRemoveButton: '.oph-button-confirm',
            date: `${id('timeline-item-date')} div`,
            text: id('timeline-item-text'),
            relatedNotificationLink: id('display-related-notification-link')
          }
        }
      }
    }
  }
}
