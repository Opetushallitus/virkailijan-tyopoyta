const title = require('crypto').randomBytes(4).toString('hex')

module.exports = {
  before: browser => browser.page.pageObjects().loginLuokka(),

  after: browser => {
    require('../componentTests/notifications/removeNotification')['remove notification'](browser)

    browser.end()
  },

  'open editor': (browser, name) => require('../componentTests/common/modal')['open modal'](browser, 'editor'),

  'create notification': browser => {
    const page = browser.page.pageObjects()

    page.createNotification({ language: 'fi', title })
    page.targeting()
    page.preview()
    page.save()
  },

  'draft is saved': browser => {
    const menu = browser.page.pageObjects().section.menu

    browser.execute('location.reload()')

    menu.expect.element('@editDraftButton').to.be.enabled.after(5000)
  },

  'edit draft': browser => {
    const menu = browser.page.pageObjects().section.menu
    const editNotification = browser.page.pageObjects().section.editor.section.editNotification

    menu.click('@editDraftButton')

    editNotification.expect.element('@title').value.to.equal(title).after(5000)
  },

  'preview': browser => browser.page.pageObjects().preview(),

  'save': browser => browser.page.pageObjects().save(),

  'draft is removed': browser => {
    const menu = browser.page.pageObjects().section.menu

    menu.expect.element('@editDraftButton').to.not.be.enabled
  }
}
