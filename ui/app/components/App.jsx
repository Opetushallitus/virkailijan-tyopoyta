import React, { PropTypes } from 'react'
import R from 'ramda'

// Data
import roles from '../data/myroles.json'
import translation from '../data/translation.json'
import urls from '../data/virkailijan-tyopoyta-urls.json'

// Components
import Menu from './menu/Menu'
import Notifications from './notifications/Notifications'
import UnpublishedNotifications from './unpublishedNotifications/UnpublishedNotifications'
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
        <div className="fixed bottom-0 right-0 mb2 mr2 z2">
          {state.view.alerts.map(alert =>
            <Alert
              key={alert.id}
              id={alert.id}
              type={alert.type}
              title={alert.title}
              text={alert.text}
              onCloseButtonClick={controller.view.removeAlert}
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
            isMobileMenuVisible={state.view.isMobileMenuVisible}
          />

          <div className={`flex flex-wrap col-12 mt3`}>
            {/*Notification/timeline view selection for small screens*/}
            <Tabs className="md-hide lg-hide">
              <TabItem
                className="sm-col-6"
                name="notifications"
                selectedTab={selectedTab}
                onClick={controller.view.toggleTab}
              >
                {translate('tiedotteet')}
              </TabItem>

              <TabItem
                className="sm-col-6"
                name="timeline"
                selectedTab={selectedTab}
                onClick={controller.view.toggleTab}
              >
                {translate('aikajana')}
              </TabItem>
            </Tabs>

            {/*Notifications*/}
            <section
              className={`col-12 md-col-7 pr2 ${selectedTab === 'notifications' ? 'block' : 'xs-hide sm-hide'}`}
            >
              <Notifications
                controller={controller.notifications}
                locale={state.locale}
                notifications={state.notifications}
                tags={state.tags}
              />
            </section>

            {/*Timeline*/}
            <section className={`col-12 md-col-5 relative ${selectedTab === 'timeline' ? 'block' : 'xs-hide sm-hide'}`}>
              <Timeline
                controller={controller.timeline}
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
          onCloseButtonClick={controller.editor.toggle}
        >
          <Editor
            controller={controller.editor}
            locale={state.locale}
            dateFormat={state.dateFormat}
            editor={state.editor}
            userGroups={state.userGroups}
            categories={state.categories}
            tags={state.tags}
          />
        </Modal>

        {/*Unpublished notifications*/}
        <Modal
          title={translate('julktiedotteet')}
          isVisible={state.unpublishedNotifications.isVisible}
          variant="large"
          onCloseButtonClick={controller.unpublishedNotifications.toggle}
        >
          <UnpublishedNotifications
            controller={controller.unpublishedNotifications}
            locale={state.locale}
            notifications={state.unpublishedNotifications}
          />
        </Modal>
      </div>
    )
  }
}

App.propTypes = propTypes

export default App
