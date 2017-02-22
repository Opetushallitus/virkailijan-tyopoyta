import React, { PropTypes } from 'react'
import moment from 'moment'

import EditNotification from './EditNotification'
import EditTimeline from './EditTimeline'
import Targeting from './Targeting'
import PreviewRelease from './PreviewRelease'
import Button from '../common/buttons/Button'
import Tabs from '../common/tabs/Tabs'
import TabItem from '../common/tabs/TabItem'
import Alert from '../common/Alert'
import Popup from '../common/Popup'
import Delay from '../common/Delay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

import getTimelineItems from './getTimelineItems'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  editor: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired
}

// Returns a translation key representing the notification's publication state
const getNotificationPublicationStateString = (createdAt, dateFormat) => {
  // No createdAt = a draft
  if (!createdAt) {
    return 'luonnos'
  }

  // createdAt is after today = unpublished
  if (moment(createdAt, dateFormat).isAfter(moment())) {
    return 'julkaisematon'
  }

  // createdAt is before today = published
  if (moment(createdAt, dateFormat).isBefore(moment())) {
    return 'julkaistu'
  }
}

// Returns a translation key representing the notification's validation state
const getNotificationValidationStateString = state => {
  if (state === 'empty') {
    return 'eisisaltoa'
  }

  if (state === 'incomplete') {
    return 'kesken'
  }

  if (state === 'complete') {
    return 'valmis'
  }
}

function Editor (props) {
  const {
    controller,
    locale,
    dateFormat,
    editor,
    tags
  } = props

  const {
    alerts,
    selectedTab,
    isPreviewed,
    hasSaveFailed,
    editedRelease,
    categories,
    userGroups,
    isLoading
  } = editor

  const notification = editedRelease.notification
  const timeline = editedRelease.timeline
  const emptyTimelineItems = getTimelineItems(['empty'], timeline)
  const incompleteTimelineItems = getTimelineItems(['incomplete'], timeline)
  const completeTimelineItems = getTimelineItems(['complete'], timeline)

  // Set default release and notification validation states for unpublishedReleases/published releases
  editedRelease.validationState = editedRelease.id > 0
    ? editedRelease.validationState || 'complete'
    : editedRelease.validationState

  notification.validationState = notification.id > 0
    ? notification.validationState || 'complete'
    : notification.validationState

  const notificationValidationStateString = getNotificationValidationStateString(notification.validationState)
  const notificationPublicationStateString = getNotificationPublicationStateString(notification.createdAt, dateFormat)

  const handleSubmit = event => {
    event.preventDefault()

    if (isPreviewed) {
      controller.save()
    } else {
      controller.togglePreview(true)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      {/*Heading for screen readers*/}
      <h2 className="hide">
        {
          notificationPublicationStateString === 'luonnos'
            ? translate('lisaauusi')
            : translate('muokkaatiedotteita')
        }
      </h2>

      {/*Alerts*/}
      <div className={`my3 ${alerts.length > 0 ? '' : 'display-none'}`}>
        {alerts.map(alert =>
          <Alert
            key={alert.id}
            id={alert.id}
            type={alert.type}
            title={alert.title}
            text={alert.text}
            onCloseButtonClick={controller.removeAlert}
          />
        )}
      </div>

      {/*Tabs and release's state*/}
      <div className="flex flex-wrap px3">
        <Tabs className="md-col-8 mb0">
          <TabItem
            name="edit-notification"
            selectedTab={selectedTab}
            onClick={controller.toggleTab}
          >
            {translate('tiedote')}

            {
              isLoading
                ? null
                : <span className="lowercase">
                  &nbsp;({translate(notificationValidationStateString)})
                </span>
            }
          </TabItem>

          <TabItem
            name="edit-timeline"
            selectedTab={selectedTab}
            onClick={controller.toggleTab}
          >
            {translate('aikajana')}

            {
              isLoading
                ? null
                : <span className="lowercase">
                  &nbsp;({
                    completeTimelineItems.length
                      ? completeTimelineItems.length
                      : translate('eisisaltoa')
                  })
                </span>
            }
          </TabItem>

          <TabItem
            name="targeting"
            selectedTab={selectedTab}
            onClick={controller.toggleTab}
          >
            {translate('kohdennus')}
          </TabItem>
        </Tabs>

        {/*Publication state*/}
        <div
          className="h5 caps muted md-flex flex-auto items-center justify-end
          mt2 md-mt0 md-border-bottom border-gray-lighten-2"
        >
          {
            isLoading
              ? null
              : <span>{translate('tila')}:&nbsp;{translate(notificationPublicationStateString)}</span>
          }
        </div>
      </div>

      {/*Edit and target content*/}
      <div className="tab-content px3">
        {/*Notification*/}
        <section className={`tab-pane ${selectedTab === 'edit-notification' ? 'tab-pane-is-active' : ''}`}>
          {
            isLoading
              ? <Delay time={1000}>
                <Spinner isVisible />
              </Delay>
              : <EditNotification
                locale={locale}
                dateFormat={dateFormat}
                controller={controller.editNotification}
                notification={editedRelease.notification}
                tags={tags}
              />
          }
        </section>

        {/*Timeline*/}
        <section className={`tab-pane ${selectedTab === 'edit-timeline' ? 'tab-pane-is-active' : ''}`}>
          {
            isLoading
              ? <Delay time={1000}>
                <Spinner isVisible />
              </Delay>
              : <EditTimeline
                locale={locale}
                dateFormat={dateFormat}
                controller={controller.editTimeline}
                release={editedRelease}
              />
          }
        </section>

        {/*Categories and user groups*/}
        <section className={`tab-pane ${selectedTab === 'targeting' ? 'tab-pane-is-active' : ''}`}>
          {
            isLoading
              ? <Delay time={1000}>
                <Spinner isVisible />
              </Delay>
              : <Targeting
                locale={locale}
                controller={controller.editRelease}
                categories={categories}
                userGroups={userGroups}
                release={editedRelease}
              />
          }
        </section>
      </div>

      {/*Preview*/}
      { isPreviewed
        ? <section className="pt3 px3 border-top border-gray-lighten-3">
          <PreviewRelease
            locale={locale}
            categories={categories}
            userGroups={userGroups}
            release={editedRelease}
          />
        </section>
        : null
      }

      {/*Form actions*/}
      <div className={`center pt3 px3 border-gray-lighten-3 ${isPreviewed ? '' : 'border-top'}`}>
        {/*Preview & publish*/}
        <Button
          className="editor-button-save button button-primary button-lg"
          type="submit"
          disabled={
            isLoading ||
            // Release is empty
            editedRelease.validationState === 'empty' ||
            // Release is incomplete
            editedRelease.validationState === 'incomplete' ||
            // Notification is empty and empty timeline items exist
            (notification.validationState === 'empty' && emptyTimelineItems.length === timeline.length) ||
            // Notification is incomplete
            notification.validationState === 'incomplete' ||
            // Incomplete timeline items exist
            incompleteTimelineItems.length
          }
          isLoading={isLoading}
        >
          {isPreviewed ? translate('julkaise') : translate('esikatselejulkaise')}
        </Button>
      </div>

      {
        hasSaveFailed
          ? <Popup
            target="-button-save"
            type="error"
            position="right"
            title={translate('julkaisuepaonnistui')}
            text={translate('kokeileuudestaan')}
            onOutsideClick={controller.toggleHasSaveFailed}
          />
          : null
      }
    </form>
  )
}

Editor.propTypes = propTypes

export default Editor
