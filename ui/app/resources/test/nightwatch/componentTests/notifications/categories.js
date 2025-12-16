module.exports = {
  before: browser => browser.page.pageObjects().loginLuokka(),

  after: browser => {
    browser.end()
  },

  'categories are fetched': browser => {
    const categories = browser.page.pageObjects().section.notifications.section.categories

    categories
      .waitForElementVisible('@toggleButton', 5000)
      .isVisible('@collapse', result => {
        if (!result.value) {
          categories.click('@toggleButton')
        }
      })

    categories.expect.element('@categoryLabel').to.be.visible

    categories.click('@toggleButton')
  },

  'select category': browser => {
    const categories = browser.page.pageObjects().section.notifications.section.categories

    categories
      .click('@toggleButton')
      .click('@categoryLabel')

    categories.expect.element('@categoryCheckbox').to.be.selected

    categories.expect.element('@title').text.to.contain('1')

    categories.click('@toggleButton')
  },

  'selected categories were saved': browser => {
    const categories = browser.page.pageObjects().section.notifications.section.categories

    browser.execute('location.reload()')

    categories
      .waitForElementVisible('@toggleButton', 5000)
      .click('@toggleButton')

    categories.expect.element('@categoryCheckbox').to.be.selected

    categories.click('@toggleButton')
  },

  'deselect category': browser => {
    const categories = browser.page.pageObjects().section.notifications.section.categories

    categories
      .click('@toggleButton')
      .click('@categoryLabel')

    categories.expect.element('@categoryCheckbox').to.not.be.selected

    categories.expect.element('@title').text.to.not.contain('1')

    categories.click('@toggleButton')
  }
}
