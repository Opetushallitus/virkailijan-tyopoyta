module.exports = {
  before: browser => browser.page.pageObjects().loginLuokka(),

  after: browser => {
    require('../componentTests/notifications/categories')['deselect category'](browser)
    require('../componentTests/notifications/removeNotification')['remove notification'](browser)

    browser.end()
  },

  'open editor': (browser, name) => require('../componentTests/common/modal')['open modal'](browser, 'editor'),

  'create notification': browser => {
    const page = browser.page.pageObjects()

    page.createNotification({ language: 'fi' })
    page.targeting()
    page.preview()
    page.save()
  },

  'select category': browser => {
    const categories = require('../componentTests/notifications/categories')

    categories['categories are fetched'](browser)
    categories['select category'](browser)
    categories['selected categories were saved'](browser)
  },

  'select tag': browser => {
    const tagGroups = require('../componentTests/notifications/tagGroups')

    tagGroups['display tag groups'](browser)
    tagGroups['select tag'](browser)
  },

  'notification is present': browser => {
    const notifications = browser.page.pageObjects().section.notifications
    const notification = notifications.section.notification
    const categories = browser.page.pageObjects().section.notifications.section.categories

    categories.click('@toggleButton')

    notifications
      .waitForElementPresent(notification.selector, 5000)
      .getText(categories.elements.categoryLabel.selector, result => {
        notification.expect.element('@tag').text.to.equal(result.value.toUpperCase())
      })

    categories.click('@toggleButton')

    browser.elements('css selector', notification.selector, result => {
      browser.assert.equal(result.value.length, 1, 'one notification is listed')
    })
  }
}
