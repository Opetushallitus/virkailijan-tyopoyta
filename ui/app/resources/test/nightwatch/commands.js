module.exports = {
  login: {
    luokka: browser => {
      const {
        url,
        username,
        password
      } = browser.globals.luokka

      const loginAlert = browser.page.pageObjects().elements.loginAlert.selector
      const container = browser.page.pageObjects().elements.container.selector

      browser
        .init()
        .waitForElementPresent(loginAlert, 5000, function () {
          browser
            .execute(`window.open("${url}")`)
            .windowHandles(result => this.switchWindow(result.value[1]))
            .setValue('input#username', username)
            .setValue('input#password', [password, browser.Keys.ENTER])
            .execute('window.close()')
            .windowHandles(result => this.switchWindow(result.value[0]))
            .execute('location.reload()')
            .waitForElementNotPresent(loginAlert, 5000)
        })

      browser.expect.element(container).to.be.visible.after(5000)
    }
  },
  editorCommands: {
    toggleTab: (browser, tab = 'edit-timeline') => {
      const editor = browser.page.pageObjects().section.editor
      const tabItem = browser.globals.id(`tab-item-${tab}`)

      editor.click(tabItem)

      editor.expect.element(tabItem).to.be.present.after(300)
    },

    createNotification: (browser, { language, title, description, startDate, endDate }) => {
      const editor = browser.page.pageObjects().editorCommands
      const editNotification = require('./componentTests/editor/editNotification')
      const targeting = require('./componentTests/editor/targeting')

      editNotification['set title'](browser, language, title)

      editNotification['set description'](browser, description)

      editNotification['set start date'](browser, startDate)

      editNotification['set end date'](browser, endDate)

      editor.toggleTab(browser, 'targeting')

      targeting['select tag'](browser)

      editor.toggleTab(browser, 'edit-notification')
    },

    createTimelineItem: (browser, { text, date }) => {
      const editor = browser.page.pageObjects().editorCommands
      const editTimeline = require('./componentTests/editor/editTimeline')

      editor.toggleTab(browser, 'edit-timeline')

      editTimeline['set text'](browser, text)

      editTimeline['set date'](browser, date)
    },

    targeting: browser => {
      const editor = browser.page.pageObjects().editorCommands
      const targeting = require('./componentTests//editor/targeting')

      editor.toggleTab(browser, 'targeting')

      targeting['select category'](browser)

      targeting['select user group'](browser)
    },

    preview: browser => {
      const editor = browser.page.pageObjects().section.editor

      editor.expect.element('@submit').to.be.enabled

      editor.click('@submit')

      editor.expect.element('@preview').to.be.present
    },

    save: browser => {
      const editor = browser.page.pageObjects().section.editor
      const alerts = browser.page.pageObjects().section.alerts

      editor.click('@submit')

      browser.expect.element('@editor').to.not.be.present.after(5000)

      alerts.expect.element('@alert')
        .to.have.attribute('class', 'First view alert is a "success" variant').which.contains('success')
    }
  }
}
