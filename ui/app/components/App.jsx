import React, { PropTypes } from 'react'
import 'babel-polyfill'

// Components
import NotificationsMenu from './notifications/NotificationsMenu'
import Notifications from './notifications/Notifications'
import UnpublishedNotifications from './unpublishedNotifications/UnpublishedNotifications'
import Timeline from './timeline/Timeline'
import Editor from './editor/Editor'
import EmailSettings from './settings/EmailSettings'
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

    this.handleTimelineTabItemClick = this.handleTimelineTabItemClick.bind(this)
  }

  componentDidUpdate (prevProps) {
    // Update when translations are received
    if (prevProps.state.translations.items !== this.props.state.translations.items) {
      setTranslations(this.props.state.translations.items)
      this.forceUpdate()
    }
  }

  handleTimelineTabItemClick () {
    const controller = this.props.controller

    controller.view.toggleTab('timeline')

    // Fetch timeline items on first tab change
    this.props.state.timeline.preloadedItems.length
      ? controller.timeline.getPreloadedMonth()
      : controller.timeline.getPreviousMonth()
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
            ? <div data-selenium-id="login-alert">
              <Alert
                id={1}
                variant="error"
                titleKey="Käyttäjätietojen haku epäonnistui"
                textKey="Kokeile päivittää sivu."
              />
            </div>
            : null
        }

        {/*Modals*/}

        {/*Editor*/}
        {
          state.editor.isVisible
            ? <Modal
              variant="big"
              title={translate('julkaisueditori')}
              name="editor"
              isCloseDisabled={state.editor.isSavingRelease}
              onCloseButtonClick={controller.editor.close}
            >
              <Editor
                controller={controller.editor}
                user={state.user}
                dateFormat={state.dateFormat}
                editorState={state.editor}
                userGroups={state.userGroups}
                categories={state.categories}
                tagGroups={state.tagGroups}
                targetingGroups={state.targetingGroups}
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
              name="unpublished-notifications"
              onCloseButtonClick={controller.unpublishedNotifications.close}
            >
              <UnpublishedNotifications
                controller={controller.unpublishedNotifications}
                defaultLocale={state.defaultLocale}
                locale={state.user.lang}
                notifications={state.unpublishedNotifications}
              />
            </Modal>
            : null
        }

        {/*Content, hidden if login has failed*/}
        <div className={`container ${state.user.hasLoadingFailed ? 'display-none' : ''}`} data-selenium-id="container">
          {/*Alerts*/}
          <div className="alert-container col-12 md-col-6 lg-col-4 px2" data-selenium-id="alert-container">
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

          {/*Spinner to display while login or fetching translations is in process*/}
          {
            state.user.isLoading || state.translations.isLoading
              ? <div className="py3">
                <Delay time={1000}>
                  <Spinner isVisible />
                </Delay>
              </div>
              : null
          }

          {/*Hidden while login or fetching translations is in process*/}
          <div
            className={
              `flex flex-wrap col-12
              ${state.user.isLoading || state.translations.isLoading ? 'display-none' : ''}`
            }
          >
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
                  onClick={this.handleTimelineTabItemClick}
                >
                  {translate('aikajana')}
                </TabItem>
              </Tabs>
            </div>

            {/*Notifications*/}
            <section
              className={`col-12 md-col-7 md-pr2 ${selectedTab === 'notifications' ? 'block' : 'xs-hide sm-hide'}`}
            >
              {/*Menu, displayed only for admin users*/}
              {
                state.user.isAdmin
                  ? <NotificationsMenu controller={controller} draft={state.draft} />
                  : null
              }

              {/*Settings*/}
              <div className="mt2">
                <EmailSettings
                  controller={controller.user}
                  user={state.user}
                />
              </div>

              <div className="mt3">
                <Notifications
                  controller={controller.notifications}
                  defaultLocale={state.defaultLocale}
                  user={state.user}
                  notifications={state.notifications}
                  specialNotifications={state.specialNotifications}
                  categories={state.categories}
                  tagGroups={state.tagGroups}
                />
              </div>
            </section>

            {/*Timeline*/}
            <section
              className={`col-12 md-col-5 relative mt1 ${selectedTab === 'timeline' ? 'block' : 'xs-hide sm-hide'}`}
            >
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
