// Create, edit and remove a timeline item

const text = require('crypto').randomBytes(4).toString('hex')
const editedText = 'edit'

module.exports = {
  before: browser => browser.page.pageObjects().login.luokka(browser),

  after: browser => {
    browser.end()
  },

  'open editor': browser => require('../componentTests/common/modal')['open modal'](browser, 'editor'),

  'create timeline item': browser => {
    const editor = browser.page.pageObjects().releaseEditor

    editor.createTimelineItem(browser, { text })
    editor.targeting(browser)
    editor.preview(browser)
    editor.save(browser)
  },

  'timeline item was saved and has content': browser => {
    const timelineItem = browser.page.pageObjects().section.timeline.section.timelineItem

    timelineItem.expect.element('@date').to.be.present

    timelineItem.expect.element('@text').text.to.equal(text)
  },

  'open timeline item in editor': browser => {
    const timelineItem = browser.page.pageObjects().section.timeline.section.timelineItem
    const editTimeline = browser.page.pageObjects().section.editor.section.editTimeline

    timelineItem
      .click('@editButton')
      .waitForElementPresent(editTimeline.selector, 5000)
  },

  'edit finnish text': browser => require('../componentTests/editor/editTimeline')['set text'](browser, editedText),

  'preview edit': browser => browser.page.pageObjects().releaseEditor.preview(browser),

  'save edit': browser => browser.page.pageObjects().releaseEditor.save(browser),

  'timeline item was edited': browser => {
    const timelineItem = browser.page.pageObjects().section.timeline.section.timelineItem

    timelineItem.expect.element('@text')
      .text.to.equal(`${editedText}${text}`).after(5000)
  },

  'remove timeline item': browser => require('../componentTests/timeline/removeTimelineItem')['remove timeline item'](browser)
}
