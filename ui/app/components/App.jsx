import React, { PropTypes } from 'react'

// Data
import roles from '../data/myroles.json'
import translation from '../data/translation.json'
import urls from '../data/virkailijan-tyopoyta-urls.json'

// Components
import Modal from './common/Modal'
import Menu from './menu/Menu'
import Notifications from './notifications/Notifications'
import Timeline from './timeline/Timeline'
import EditRelease from './editor/EditRelease'
import Translations from './common/Translations'

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
      .then(data => Translations.setTranslations(data))
      .catch(() => {
        if (window.location.host.indexOf('localhost') === 0 || window.location.host.indexOf('10.0.2.2') === 0) { // dev mode (copypaste from upper)
          Translations.setTranslations(translation)
        } else { // real usage
          if (window.location.href.indexOf('ticket=') > 0) { // to prevent strange cyclic cas login problems (atm related to sticky sessions)
            window.alert('Problems with login, please reload page or log out and try again')
          } else {
            window.location.href = urls['cas.login'] + window.location.href
          }
        }
      })
  }

  render () {
    const {
      state,
      controller
    } = this.props

    return (
      <div>
        {/*Content*/}
        <div className="container flex flex-wrap mx-auto">
          {/*Menu*/}
          <Menu
            controller={controller}
            categories={state.categories}
            isMobileMenuVisible={state.menu.isMobileMenuVisible}
          />

          {/*Notifications*/}
          <section className="col-12 md-col-7 mt3 md-pr2">
            <div className="alert alert-warning mb3">
              Haku ei ole vielä toiminnassa
            </div>

            <Notifications
              controller={controller}
              locale={state.locale}
              nextPage={state.nextPage}
              notifications={state.notifications}
              expandedNotifications={state.expandedNotifications}
              notificationTags={state.notificationTags}
              selectedNotificationTags={state.selectedNotificationTags}
            />
          </section>

          {/*Timeline*/}
          <section className="col-12 md-col-5 mt3 md-pl2">
            <div className="alert alert-warning mb3">
              Testidataa, ei muokattavissa
            </div>

            <Timeline
              controller={controller}
              locale={state.locale}
              dateFormat={state.dateFormat}
              items={state.timeline}
            />
          </section>
        </div>

        {/*Modals*/}

        {/*Editor*/}
        <Modal
          isVisible={state.editor.isVisible}
          variant="large"
          onCloseButtonClick={controller.toggleEditor}
        >
          <EditRelease
            controller={controller}
            locale={state.locale}
            dateFormat={state.dateFormat}
            selectedTab={state.editor.selectedTab}
            isPreviewed={state.editor.isPreviewed}
            release={state.editor.document}
            categories={state.categories}
            notificationTags={state.notificationTags}
          />
        </Modal>

        {/*Unpublished notifications*/}
      </div>
    )
  }
}

App.propTypes = propTypes

export default App
