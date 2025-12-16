const moment = require('moment')

module.exports = {
  before: browser => browser.page.pageObjects().loginLuokka(),

  after: browser => {
    browser.end()
  },

  'open editor': browser => require('../common/modal')['open modal'](browser, 'editor'),

  'toggle timeline tab': browser => browser.page.pageObjects().toggleTab('edit-timeline'),

  'set text': (browser, text = require('crypto').randomBytes(4).toString('hex')) => {
    const editor = browser.page.pageObjects().section.editor
    const editTimeline = editor.section.editTimeline

    editTimeline.click('@textEditor')

    browser.keys(text)

    editTimeline.expect.element('@text')
      .text.to.contain(text)
  },

  'set date': browser => {
    const editor = browser.page.pageObjects().section.editor
    const editTimeline = editor.section.editTimeline
    const today = moment().format(browser.globals.dateFormat)

    editTimeline.setValue('@date', today)

    editTimeline.expect.element('@date').to.have.value.that.equals(today)
  },

  'add new timeline item': browser => {
    const editor = browser.page.pageObjects().section.editor
    const editTimeline = editor.section.editTimeline

    editTimeline.click('@addItemButton')

    editTimeline.expect.element('@newItemText').to.be.present
  },

  'remove timeline item': browser => {
    const editor = browser.page.pageObjects().section.editor
    const editTimeline = editor.section.editTimeline

    editTimeline.click('@newItemRemoveButton')

    editTimeline.expect.element('@newItemRemoveButton').to.not.be.present
  }
}
