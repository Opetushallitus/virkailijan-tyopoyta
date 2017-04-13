module.exports = {
  before: browser => browser.page.pageObjects().login.luokka(browser),

  after: browser => {
    browser.end()
  },

  'open editor': browser => require('../componentTests/common/modal')['open modal'](browser, 'editor'),

  'create notification': browser => {
    const editor = browser.page.pageObjects().editorCommands

    editor.createNotification(browser)
    editor.targeting(browser)
    editor.preview(browser)
    editor.save(browser)
  },

  'remove notification': browser => {
    const alerts = browser.page.pageObjects().section.alerts
    const notifications = browser.page.pageObjects().section.notifications
    const notification = notifications.section.notification

    notification
      .click('@removeButton')
      .waitForElementPresent('@confirmRemovePopup', 300)
      .click('@confirmRemoveButton')

    notifications.expect.element(notification.selector).to.not.be.present.after(5000)

    alerts.expect.element('@alert')
      .to.have.attribute('class', 'First view alert is a "success" variant').which.contains('oph-alert-success')
  }
}
