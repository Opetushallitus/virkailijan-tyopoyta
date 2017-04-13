const last = require('ramda').last

module.exports = {
  before: browser => browser.page.pageObjects().login.luokka(browser),

  after: browser => {
    const categories = browser.page.pageObjects().section.notifications.section.categories

    require('../componentTests/notifications/removeNotification')['remove notification'](browser)

    require('../componentTests/timeline/removeTimelineItem')['remove timeline item'](browser)

    browser.execute('location.reload()')

    categories
      .waitForElementVisible('@toggleButton', 5000)
      .click('@toggleButton')

    browser.elements('css selector', categories.elements.categoryLabel.selector, result => {
      browser.elementIdClick(last(result.value).ELEMENT)
    })

    browser.end()
  },

  'open editor': browser => require('../componentTests/common/modal')['open modal'](browser, 'editor'),

  'create notification': browser => {
    const editor = browser.page.pageObjects().editorCommands

    editor.createNotification(browser, { language: 'fi' })
    editor.createTimelineItem(browser, { language: 'fi' })
    editor.targeting(browser)
    editor.preview(browser)
    editor.save(browser)
  },

  'select category filter': browser => {
    const categories = browser.page.pageObjects().section.notifications.section.categories

    categories.click('@toggleButton')

    browser.elements('css selector', categories.elements.categoryLabel.selector, result => {
      browser.elementIdClick(last(result.value).ELEMENT)
    })
  },

  'click "display related notification" link': browser => {
    const timelineItem = browser.page.pageObjects().section.timeline.section.timelineItem

    timelineItem.click('@relatedNotificationLink')
  },

  'notification is present': browser => {
    const notifications = browser.page.pageObjects().section.notifications
    const notification = notifications.section.notification

    notifications.expect.element(notification.selector).to.be.present.after(5000)

    browser.elements('css selector', notification.selector, result => {
      browser.assert.equal(result.value.length, 1, 'one notification is listed')
    })
  },

  'reset notifications': browser => {
    const notifications = browser.page.pageObjects().section.notifications
    const notification = notifications.section.notification

    notification.click('@closeButton')

    notifications.expect.element(notification.selector).to.be.present.after(5000)
  }
}
