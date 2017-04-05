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
import Delay from './common/Delay'
import Spinner from './common/Spinner'
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
    let lang = 'fi'

    for (let i = 0; i < this.state.roles.length; i++) {
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
        {/*Alert for failed login*/}
        {
          state.user.hasLoadingFailed
            ? <Alert
              id="1"
              variant="error"
              titleKey="kayttajatietojenhakuepaonnistui"
              textKey="paivitasivu"
            />
            : null
        }

        {/*Modals*/}

        {/*Editor*/}
        {
          state.editor.isVisible
            ? <Modal
              variant="big"
              title={translate('julkaisueditori')}
              isCloseDisabled={state.editor.isSavingRelease}
              onCloseButtonClick={controller.editor.close}
            >
              <Editor
                controller={controller.editor}
                user={state.user}
                dateFormat={state.dateFormat}
                editor={state.editor}
                userGroups={state.userGroups}
                categories={state.categories}
                tagGroups={state.tagGroups}
              />
            </Modal>
            : null
        }

        {/*Unpublished notifications*/}
        {
          state.unpublishedNotifications.isVisible
            ? <Modal
              variant="big"
              title={translate('julktiedotteet')}
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
        <div className={`container ${state.user.hasLoadingFailed ? 'display-none' : ''}`}>
          {/*Alerts*/}
          <div className="alert-container col-12 md-col-6 lg-col-4 px2">
            {state.view.alerts.map(alert =>
              <div key={`viewAlert${alert.id}`} className="mb2">
                <Alert
                  id={alert.id}
                  variant={alert.variant}
                  titleKey={alert.titleKey}
                  textKey={alert.textKey}
                  onCloseButtonClick={controller.view.removeAlert}
                />
              </div>
            )}
          </div>

          {
            state.user.isLoading
              ? <div className="py3">
                <Delay time={1000}>
                  <Spinner isVisible />
                </Delay>
              </div>
              : null
          }

          <div className={`flex flex-wrap col-12 ${state.user.isLoading ? 'display-none' : ''}`}>
            {/*Notification/timeline view selection for small screens*/}
            <div className="col-12 mt3 md-hide lg-hide">
              <Tabs>
                <TabItem
                  name="notifications"
                  selectedTab={selectedTab}
                  column="sm-col-6"
                  onClick={controller.view.toggleTab}
                >
                  {translate('tiedotteet')}
                </TabItem>

                <TabItem
                  name="timeline"
                  selectedTab={selectedTab}
                  column="sm-col-6"
                  onClick={controller.view.toggleTab}
                >
                  {translate('aikajana')}
                </TabItem>
              </Tabs>
            </div>

            {/*Notifications*/}
            <section
              ref={notifications => (this.notifications = notifications)}
              className={`col-12 md-col-7 md-pr2 ${selectedTab === 'notifications' ? 'block' : 'xs-hide sm-hide'}`}
            >
              {/*Menu*/}
              {
                state.user.isAdmin
                  ? <NotificationsMenu controller={controller} draft={state.draft} />
                  : null
              }

              <div className="mt3">
                <Notifications
                  controller={controller.notifications}
                  defaultLocale={state.defaultLocale}
                  user={state.user}
                  notifications={state.notifications}
                  categories={state.categories}
                  tagGroups={state.tagGroups}
                />
              </div>
            </section>

            {/*Timeline*/}
            <section className={`col-12 md-col-5 relative mt1 ${selectedTab === 'timeline' ? 'block' : 'xs-hide sm-hide'}`}>
              <Timeline
                controller={controller.timeline}
                defaultLocale={state.defaultLocale}
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
