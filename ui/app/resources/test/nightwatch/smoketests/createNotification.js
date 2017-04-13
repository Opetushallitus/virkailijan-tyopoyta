// Create, edit and remove a notification

const title = require('crypto').randomBytes(4).toString('hex')
const editedTitle = 'edit'
const description = 'Kuvaus'

module.exports = {
  before: browser => browser.page.pageObjects().login.luokka(browser),

  after: browser => {
    browser.end()
  },

  'open editor': browser => require('../componentTests/common/modal')['open modal'](browser, 'editor'),

  'create notification': browser => {
    const editor = browser.page.pageObjects().editorCommands

    editor.createNotification(browser, { language: 'fi', title, description })
    editor.targeting(browser)
    editor.preview(browser)
    editor.save(browser)
  },

  'notification was saved and has content': browser => {
    const notification = browser.page.pageObjects().section.notifications.section.notification

    notification.expect.element('@heading').text.to.equal(title).after(5000)

    notification.expect.element('@content').text.to.equal(description)

    browser.elements('css selector', notification.elements.tag.selector, result => {
      browser.assert.equal(result.value.length, 2, 'notification has a category and a tag')
    })
  },

  'open notification in editor': browser => {
    const notification = browser.page.pageObjects().section.notifications.section.notification
    const editNotification = browser.page.pageObjects().section.editor.section.editNotification

    notification
      .click('@editButton')
      .waitForElementPresent(editNotification.selector, 5000)
  },

  'edit finnish title': browser => {
    const editNotification = browser.page.pageObjects().section.editor.section.editNotification

    editNotification.clearValue('@title')

    require('../componentTests/editor/editNotification')['set title'](browser, 'fi', `${title}${editedTitle}`)
  },

  'preview edit': browser => browser.page.pageObjects().editorCommands.preview(browser),

  'save edit': browser => browser.page.pageObjects().editorCommands.save(browser),

  'notification was edited': browser => {
    const notification = browser.page.pageObjects().section.notifications.section.notification

    notification.expect.element('@heading').text.to.equal(`${title}${editedTitle}`).after(5000)
  },

  'remove notification': browser =>
    require('../componentTests/notifications/removeNotification')['remove notification'](browser)
}
