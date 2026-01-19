const moment = require('moment')

module.exports = {
  before: browser => browser.page.pageObjects().loginLuokka(),

  after: browser => {
    browser.end()
  },

  'open editor': browser => require('../common/modal')['open modal'](browser, 'editor'),

  'set title': (browser, language = 'fi', title = require('crypto').randomBytes(4).toString('hex')) => {
    const editor = browser.page.pageObjects().section.editor
    const editNotification = editor.section.editNotification
    const selector = language === 'fi'
      ? '@title'
      : editNotification.elements.title.selector.replace('-fi', `-${language}`)

    editNotification.setValue(selector, title)

    editNotification.expect.element(selector).to.have.value.that.equals(title)
  },

  'set as disruption notification': browser => {
    const editor = browser.page.pageObjects().section.editor
    const editNotification = editor.section.editNotification

    editNotification.click('@disruptionNotificationLabel')

    editNotification.expect.element('@disruptionNotificationCheckbox').to.be.selected
  },

  'set description': (browser, description = 'Kuvaus') => {
    const editor = browser.page.pageObjects().section.editor
    const editNotification = editor.section.editNotification

    editNotification.click('@descriptionTextEditor')

    browser.keys(description)

    editNotification.expect.element('@descriptionText')
      .text.to.equal(description)
  },

  'format description': browser => {
    const editor = browser.page.pageObjects().section.editor
    const editNotification = editor.section.editNotification

    browser
      .moveToElement(editNotification.elements.descriptionText.selector, 1, 1)
      .doubleClick()
      .click(editNotification.elements.formatButton.selector)

    editNotification.expect.element('@formatButton')
      .to.have.attribute('class').which.contains('oph-button-icon-is-active')
  },

  'add link to description': browser => {
    const editor = browser.page.pageObjects().section.editor
    const editNotification = editor.section.editNotification
    const url = 'testi'

    browser
      .moveToElement(editNotification.elements.descriptionText.selector, 1, 1)
      .doubleClick()
      .click(editNotification.elements.addLinkButton.selector)

    editNotification.expect.element('@editLink')
      .to.be.present

    editNotification.setValue('@linkInput', url)

    editNotification.expect.element('@linkInput')
      .to.have.value.that.equals('testi')

    editNotification.click('@saveLinkButton')

    editNotification.expect.element('@editLink')
      .to.not.be.present

    editNotification.expect.element('@descriptionLink')
      .to.have.attribute('href').contains(url)
  },

  'remove link': browser => {
    const editor = browser.page.pageObjects().section.editor
    const editNotification = editor.section.editNotification

    editNotification.click('@removeLinkButton')

    editNotification.expect.element('@descriptionLink')
      .to.not.be.present
  },

  'set start date': (browser, date = moment().format(browser.globals.dateFormat)) => {
    const editor = browser.page.pageObjects().section.editor
    const editNotification = editor.section.editNotification

    editNotification.setValue('@startDate', date)

    editNotification.expect.element('@startDate')
      .to.have.value.that.equals(date)

    editNotification.click('@title')
  },

  'set end date': (browser, date = moment().add(1, 'days').format(browser.globals.dateFormat)) => {
    const editor = browser.page.pageObjects().section.editor
    const editNotification = editor.section.editNotification

    editNotification.setValue('@endDate', date)

    editNotification.expect.element('@endDate')
      .to.have.value.that.equals(date)

    editNotification.click('@title')
  },

  'update end date if start date is after end date': browser => {
    const editor = browser.page.pageObjects().section.editor
    const editNotification = editor.section.editNotification
    const dateFormat = browser.globals.dateFormat
    const dayAfterTomorrow = moment().add(2, 'days').format(dateFormat)

    editNotification
      .clearValue('@startDate')
      .setValue('@startDate', dayAfterTomorrow)

    editNotification.expect.element('@endDate')
      .to.have.value.that.equals(dayAfterTomorrow)

    editNotification.click('@title')
  },

  'update start date if end date is before start date': browser => {
    const editor = browser.page.pageObjects().section.editor
    const editNotification = editor.section.editNotification
    const dateFormat = browser.globals.dateFormat
    const today = moment().format(dateFormat)

    editNotification
      .clearValue('@endDate')
      .setValue('@endDate', today)

    editNotification.expect.element('@endDate')
      .to.have.value.that.equals(today)

    editNotification.click('@title')
  }
}
