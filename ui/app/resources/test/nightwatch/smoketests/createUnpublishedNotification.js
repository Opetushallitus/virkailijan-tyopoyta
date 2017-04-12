const moment = require('moment')

const title = require('crypto').randomBytes(4).toString('hex')
const startDate = moment().add(1, 'days').format('D.M.YYYY')
const endDate = moment().add(2, 'days').format('D.M.YYYY')

module.exports = {
  before: browser => browser.page.pageObjects().login.luokka(browser),

  after: browser => {
    browser.end()
  },

  'open editor': browser => require('../componentTests/common/modal')['open modal'](browser, 'editor'),

  'create notification': browser => {
    const editor = browser.page.pageObjects().releaseEditor

    editor.createNotification(browser, { language: 'fi', title, description: 'Kuvaus', startDate, endDate })
    editor.targeting(browser)
    editor.preview(browser)
    editor.save(browser)
  },

  'open unpublished notifications': browser =>
    require('../componentTests/common/modal')['open modal'](browser, 'unpublished-notifications'),

  'notification is present': browser => {
    const unpublishedNotifications = browser.page.pageObjects().section.unpublishedNotifications

    unpublishedNotifications.expect.element('@title').text.to.equal(title).after(5000)
  }
}
