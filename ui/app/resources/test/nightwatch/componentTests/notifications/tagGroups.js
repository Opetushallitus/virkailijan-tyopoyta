module.exports = {
  before: browser => browser.page.pageObjects().login.luokka,

  after: browser => {
    browser.end()
  },

  'display tag groups': browser => {
    const tagGroups = browser.page.pageObjects().section.notifications.section.tagGroups

    tagGroups
      .waitForElementPresent('@dropdown', 5000)
      .click('@dropdown')

    tagGroups.expect.element('@tagItem').to.be.present
  },

  'select tag': browser => {
    const tagGroups = browser.page.pageObjects().section.notifications.section.tagGroups

    tagGroups
      .click('@tagItem')
      .click('@dropdown')

    tagGroups.expect.element('@tagLabel').to.be.present
  },

  'deselect tag': browser => {
    const tagGroups = browser.page.pageObjects().section.notifications.section.tagGroups

    tagGroups.click('@tagLabel')

    tagGroups.expect.element('@tagLabel').to.not.be.present
  }
}
