import React, { PropTypes } from 'react'
import R from 'ramda'

// Data
import roles from '../data/myroles.json'
import translation from '../data/translation.json'
import urls from '../data/virkailijan-tyopoyta-urls.json'

// Components
import Menu from './menu/Menu'
import Notifications from './notifications/Notifications'
import UnpublishedNotifications from './notifications/UnpublishedNotifications'
import Timeline from './timeline/Timeline'
import Editor from './editor/Editor'
import Tabs from './common/tabs/Tabs'
import TabItem from './common/tabs/TabItem'
import Alert from './common/Alert'
import Modal from './common/Modal'
import { translate, setTranslations } from './common/Translations'

const propTypes = {
  state: PropTypes.object.isRequired,
  controller: PropTypes.object.isRequired
}

class App extends React.Component {
  constructor (props) {
    super(props)

    this.getRoles()
  }

  getRoles () {
    window.fetch(urls['cas.myroles'],
      {
        credentials: 'include'
      })
      .then(response => response.json())
      .then(roles => {
        this.setState({
          roles: roles
        })
        if (roles) {
          window.myroles = roles
          this.getTranslate()
        }
      })
      .catch(() => {
        if (window.location.host.indexOf('localhost') === 0 || window.location.host.indexOf('10.0.2.2') === 0) { // dev mode (copypaste from upper)
          this.setState({roles})
          if (roles) {
            this.getTranslate()
          }
        } else { // real usage
          if (window.location.href.indexOf('ticket=') > 0) { // to prevent strange cyclic cas login problems (atm related to sticky sessions)
            window.alert('Problems with login, please reload page or log out and try again')
          } else {
            window.location.href = urls['cas.login'] + window.location.href
          }
        }
      })
  }

  getTranslate () {
    var lang = 'fi'

    for (var i = 0; i < this.state.roles.length; i++) {
      if (this.state.roles[i].indexOf('LANG_') === 0) {
        lang = this.state.roles[i].substring(5)
      }
    }

    window.fetch(urls['lokalisointi.localisation'] + lang, {
      credentials: 'include'
    })
      .then(response => response.json)
      .then(data => {
        let json = data

        if (!R.is(Array, data)) {
          json = translation
        }

        setTranslations(json)
      })
      .catch(() => {
        if (window.location.host.indexOf('localhost') === 0 || window.location.host.indexOf('10.0.2.2') === 0) { // dev mode (copypaste from upper)
          setTranslations(translation)
        } else { // real usage
          if (window.location.href.indexOf('ticket=') > 0) { // to prevent strange cyclic cas login problems (atm related to sticky sessions)
            window.alert('Problems with login, please reload page or log out and try again')
          } else {
            window.location.href = urls['cas.login'] + window.location.href
          }
        }
      })
      .then(() => { this.forceUpdate() })
  }

  render () {
    const {
      state,
      controller
    } = this.props

    const selectedTab = state.view.selectedTab

    return (
      <div>
        {/*Alerts*/}
        <div className="box-shadow">
          {state.view.alerts.map(alert =>
            <Alert
              key={alert.id}
              type={alert.type}
              title={alert.title}
              text={alert.text}
              onCloseButtonClick={() => controller.removeViewAlert(alert.id)}
            />
          )}
        </div>

        {/*Content*/}
        <div className="container mx-auto">
          {/*Menu*/}
          <Menu
            controller={controller}
            locale={state.locale}
            dateFormat={state.dateFormat}
            categories={state.categories}
            selectedCategories={state.view.categories}
            notificationsLoaded={state.notifications.isInitialLoad}
            unpublishedNotifications={state.unpublishedNotifications.items}
            isMobileMenuVisible={state.menu.isMobileMenuVisible}
          />

          {/*Notification/timeline view selection for small screens*/}
          <Tabs className="md-hide lg-hide sm-mt3">
            <TabItem
              className="sm-col-6"
              name="notifications"
              selectedTab={selectedTab}
              onClick={controller.toggleViewTab}
            >
              {translate('tiedotteet')}
            </TabItem>

            <TabItem
              className="sm-col-6"
              name="timeline"
              selectedTab={selectedTab}
              onClick={controller.toggleViewTab}
            >
              {translate('aikajana')}
            </TabItem>
          </Tabs>

          <div className="flex flex-wrap col-12 mt3">
            {/*Notifications*/}
            <section
              className={`col-12 md-col-7 md-pr2 ${selectedTab === 'notifications' ? 'block' : 'xs-hide sm-hide'}`}
            >
              <div className="alert alert-warning block mb3 py2">
                Haku ei ole vielä toiminnassa
              </div>

              <Notifications
                controller={controller}
                locale={state.locale}
                notifications={state.notifications}
              />
            </section>

            {/*Timeline*/}
            <section className="col-12 md-col-5 md-pl2">
              <Timeline
                controller={controller}
                locale={state.locale}
                dateFormat={state.dateFormat}
                timeline={state.timeline}
              />
            </section>
          </div>
        </div>

        {/*Modals*/}

        {/*Editor*/}
        <Modal
          title={translate('julkaisueditori')}
          isVisible={state.editor.isVisible}
          isCloseDisabled={state.editor.isLoading}
          variant="large"
          onCloseButtonClick={controller.toggleEditor}
        >
          <Editor
            controller={controller}
            locale={state.locale}
            dateFormat={state.dateFormat}
            notificationTags={state.notifications.tags}
            state={state.editor}
          />
        </Modal>

        {/*Unpublished notifications*/}
        <Modal
          title={translate('julktiedotteet')}
          isVisible={state.unpublishedNotifications.isVisible}
          variant="large"
          onCloseButtonClick={controller.toggleUnpublishedNotifications}
        >
          <UnpublishedNotifications
            controller={controller}
            locale={state.locale}
            items={state.unpublishedNotifications.items}
          />
        </Modal>
      </div>
    )
  }
}

App.propTypes = propTypes

export default App
