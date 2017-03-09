import React, { PropTypes } from 'react'
import R from 'ramda'

// Data
import roles from '../data/myroles.json'
import translation from '../data/translation.json'
import urls from '../data/virkailijan-tyopoyta-urls.json'

// Components
import NotificationsMenu from './notifications/NotificationsMenu'
import Notifications from './notifications/Notifications'
import UnpublishedNotifications from './unpublishedNotifications/UnpublishedNotifications'
import Timeline from './timeline/Timeline'
import Editor from './editor/Editor'
import Tabs from './common/tabs/Tabs'
import TabItem from './common/tabs/TabItem'
import Alert from './common/Alert'
import Modal from './common/Modal'
import Conditional from './common/Conditional'
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
              titleKey={alert.titleKey}
              textKey={alert.textKey}
              onCloseButtonClick={controller.view.removeAlert}
            />
          )}
        </div>

        {/*Modals*/}

        {/*Editor*/}
        {
          state.editor.isVisible
            ? <Modal
              title={translate('julkaisueditori')}
              variant="big"
              isCloseDisabled={state.editor.isLoading}
              onCloseButtonClick={controller.editor.close}
            >
              <Editor
                controller={controller.editor}
                locale={state.user.lang}
                dateFormat={state.dateFormat}
                editor={state.editor}
                userGroups={state.userGroups}
                categories={state.categories}
                tags={state.tags}
              />
            </Modal>
            : null
        }

        {/*Unpublished notifications*/}
        {
          state.unpublishedNotifications.isVisible
            ? <Modal
              title={translate('julktiedotteet')}
              variant="big"
              onCloseButtonClick={controller.unpublishedNotifications.close}
            >
              <UnpublishedNotifications
                controller={controller.unpublishedNotifications}
                locale={state.user.lang}
                notifications={state.unpublishedNotifications}
              />
            </Modal>
            : null
        }

        {/*Content*/}
        <div className="container mx-auto">
          <div className={`flex flex-wrap col-12`}>
            {/*Notification/timeline view selection for small screens*/}
            <Tabs className="mt3 md-hide lg-hide">
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
              className={`col-12 md-col-7 md-pr2 ${selectedTab === 'notifications' ? 'block' : 'xs-hide sm-hide'}`}
            >
              {/*Menu*/}
              <Conditional isRendered={state.user.isAdmin}>
                <NotificationsMenu
                  controller={controller}
                  notificationsLoaded={state.notifications.isInitialLoad}
                />
              </Conditional>

              <div className="mt3">
                <Notifications
                  controller={controller.notifications}
                  user={state.user}
                  notifications={state.notifications}
                  categories={state.categories}
                  tags={state.tags}
                />
              </div>
            </section>

            {/*Timeline*/}
            <section className={`col-12 md-col-5 relative mt1 ${selectedTab === 'timeline' ? 'block' : 'xs-hide sm-hide'}`}>
              <Timeline
                controller={controller.timeline}
                user={state.user}
                dateFormat={state.dateFormat}
                timeline={state.timeline}
              />
            </section>
          </div>
        </div>
      </div>
    )
  }
}

App.propTypes = propTypes

export default App
