module.exports = {
  before: browser => browser.page.pageObjects().loginLuokka(),

  after: browser => {
    browser.end()
  },

  'open modal': (browser, name = 'editor') => {
    const openModalButton = browser.globals.id(`open-${name}-button`)
    const modal = browser.globals.id(`modal-${name}`)

    browser
      .waitForElementPresent(openModalButton, 5000)
      .click(openModalButton)

    browser.expect.element(modal).to.be.present
  },

  'close modal with the close button': (browser, name = 'editor') => {
    const openModalButton = browser.globals.id(`open-${name}-button`)
    const modal = browser.globals.id(`modal-${name}`)
    const closeModalButton = `${modal} .oph-button-close`

    browser.waitForElementPresent(modal, 300, result => {
      if (!result.value) {
        browser
          .click(openModalButton)
      }
    })

    browser.click(closeModalButton)

    browser.expect.element(modal).to.not.be.present
  },

  'close modal by clicking the overlay': (browser, name = 'editor') => {
    const openModalButton = browser.globals.id(`open-${name}-button`)
    const modal = browser.globals.id(`modal-${name}`)

    browser
      .click(openModalButton)
      .waitForElementPresent(modal, 300)
      .moveToElement(modal, 0, 0)
      .mouseButtonClick(0)

    browser.expect.element(modal).to.not.be.present
  },

  'close modal by pressing Esc': (browser, name = 'editor') => {
    const openModalButton = browser.globals.id(`open-${name}-button`)
    const modal = browser.globals.id(`modal-${name}`)

    browser
      .click(openModalButton)
      .waitForElementPresent(modal, 300)
      .keys(browser.Keys.ESCAPE)

    browser.expect.element(modal).to.not.be.present
  }
}
