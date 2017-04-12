const title = require('crypto').randomBytes(4).toString('hex')

module.exports = {
  before: browser => browser.page.pageObjects().login.luokka(browser),

  after: browser => {
    require('../componentTests/notifications/removeNotification')['remove notification'](browser)

    browser.end()
  },

  'open editor': (browser, name) => require('../componentTests/common/modal')['open modal'](browser, 'editor'),

  'create notification': browser => {
    const editor = browser.page.pageObjects().releaseEditor

    editor.createNotification(browser, { language: 'fi', title })
    editor.targeting(browser)
    editor.preview(browser)
    editor.save(browser)
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

  'preview': browser => browser.page.pageObjects().releaseEditor.preview(browser),

  'save': browser => browser.page.pageObjects().releaseEditor.save(browser),

  'draft is removed': browser => {
    const menu = browser.page.pageObjects().section.menu

    menu.expect.element('@editDraftButton').to.not.be.enabled
  }
}
