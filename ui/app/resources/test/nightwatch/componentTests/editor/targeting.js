module.exports = {
  before: browser => browser.page.pageObjects().login.luokka(browser),

  after: browser => {
    browser.end()
  },

  'open editor': browser => require('../common/modal')['open modal'](browser, 'editor'),

  'set title': browser => require('./editNotification')['set title'](browser),

  'toggle targeting tab': browser => browser.page.pageObjects().editorCommands.toggleTab(browser, 'targeting'),

  'select category': browser => {
    const editor = browser.page.pageObjects().section.editor
    const targeting = editor.section.targeting

    targeting.click('@categoryLabel')

    targeting.expect.element('@categoryCheckbox').to.be.selected
  },

  'select user group': browser => {
    const editor = browser.page.pageObjects().section.editor
    const targeting = editor.section.targeting

    targeting
      .click('@userGroupDropdown')
      .click('@userGroupItem')

    targeting.expect.element('@userGroupButton').to.be.present
  },

  'select tag': browser => {
    const editor = browser.page.pageObjects().section.editor
    const targeting = editor.section.targeting

    targeting.click('@tagButton')

    targeting.expect.element('@tagCheckbox').to.be.selected
  },

  'set targeting name': browser => {
    const editor = browser.page.pageObjects().section.editor
    const targeting = editor.section.targeting
    const name = 'testi'

    targeting.setValue('@targetingName', name)

    targeting.expect.element('@targetingName').to.have.value.that.equals(name)
  }
}
