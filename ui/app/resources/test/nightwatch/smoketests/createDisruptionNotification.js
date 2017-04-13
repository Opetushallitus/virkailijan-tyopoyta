module.exports = {
  before: browser => browser.page.pageObjects().login.luokka(browser),

  after: browser => {
    require('../componentTests/notifications/removeNotification')['remove notification'](browser)

    browser.end()
  },

  'open editor': browser => require('../componentTests/common/modal')['open modal'](browser, 'editor'),

  'create notification': browser => {
    const editor = browser.page.pageObjects().editorCommands

    editor.createNotification(browser, { language: 'fi' })
    require('../componentTests/editor/editNotification')['set as disruption notification'](browser)

    editor.targeting(browser)
    editor.preview(browser)
    editor.save(browser)
  },

  'notification was saved and is a disruption notification': browser => {
    const notification = browser.page.pageObjects().section.notifications.section.notification
    const disruptionNotification = notification.elements.disruptionNotification.selector

    browser.expect.element(`${notification.selector} ${disruptionNotification}`).to.be.present.after(5000)
  }
}
