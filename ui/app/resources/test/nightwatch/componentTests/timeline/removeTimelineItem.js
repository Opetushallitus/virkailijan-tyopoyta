module.exports = {
  before: browser => browser.page.pageObjects().loginLuokka(),

  after: browser => {
    browser.end()
  },

  'open editor': browser => require('../componentTests/common/modal')['open modal'](browser, 'editor'),

  'create timeline item': browser => {
    const page = browser.page.pageObjects()

    page.createTimelineItem({ text })
    page.targeting()
    page.preview()
    page.save()
  },

  'remove timeline item': (browser) => {
    const alerts = browser.page.pageObjects().section.alerts
    const timeline = browser.page.pageObjects().section.timeline
    const timelineItem = timeline.section.timelineItem

    timelineItem
      .click('@removeButton')
      .click('@confirmRemoveButton')

    timeline.expect.element(timelineItem.selector).to.not.be.present.after(5000)

    alerts.expect.element('@alert')
      .to.have.attribute('class', 'First view alert is a "success" variant')
      .which.contains('oph-alert-success')
  }
}
