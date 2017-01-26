import React, { PropTypes } from 'react'
import moment from 'moment'

import EditNotification from './EditNotification'
import EditTimeline from './EditTimeline'
import Targeting from './Targeting'
import PreviewRelease from './PreviewRelease'
import Button from '../common/buttons/Button'
import Tabs from '../common/tabs/Tabs'
import TabItem from '../common/tabs/TabItem'
import Translation, { translate } from '../common/Translations'

import getTimelineItems from './getTimelineItems'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  selectedTab: PropTypes.string.isRequired,
  isPreviewed: PropTypes.bool.isRequired,
  release: PropTypes.object.isRequired,
  notificationTags: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  userGroups: PropTypes.array.isRequired
}

// Returns a translation key representing the notification's publication state
const getNotificationPublicationStateString = (initialDate, dateFormat) => {
  // No initialStartDate = a draft
  if (!initialDate) {
    return 'luonnos'
  }

  // initialStartDate is after today = unpublishedReleases
  if (moment(initialDate, dateFormat).isAfter(moment())) {
    return 'julkaisematon'
  }

  // initialStartDate is before today = published
  if (moment(initialDate, dateFormat).isBefore(moment())) {
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

function EditRelease (props) {
  const {
    controller,
    locale,
    dateFormat,
    selectedTab,
    isPreviewed,
    release,
    notificationTags,
    categories,
    userGroups
  } = props

  const notification = release.notification
  const timeline = release.timeline
  const emptyTimelineItems = getTimelineItems(['empty'], timeline)
  const incompleteTimelineItems = getTimelineItems(['incomplete'], timeline)
  const completeTimelineItems = getTimelineItems(['complete'], timeline)

  // Set default release and notification validation states for unpublishedReleases/published releases
  release.validationState = release.id > 0
    ? release.validationState || 'complete'
    : release.validationState

  notification.validationState = notification.id > 0
    ? notification.validationState || 'complete'
    : notification.validationState

  const notificationValidationStateString = getNotificationValidationStateString(notification.validationState)
  const notificationPublicationStateString = getNotificationPublicationStateString(notification.initialDate, dateFormat)

  const handleOnSubmit = event => {
    event.preventDefault()

    if (isPreviewed) {
      controller.saveDocument()
    } else {
      controller.toggleDocumentPreview(true)
    }
  }

  return (
    <form noValidate onSubmit={handleOnSubmit}>
      {/*Heading for screen readers*/}
      <h2 className="hide">
        {
          notificationPublicationStateString === 'luonnos'
            ? translate('lisaauusi')
            : translate('muokkaatiedotteita')
        }
      </h2>

      {/*Tabs and release's state*/}
      <div className="flex flex-wrap px3">
        <Tabs className="md-col-8 mb0">
          <TabItem
            name="edit-notification"
            selectedTab={selectedTab}
            onClick={controller.toggleEditorTab}
          >
            <Translation trans="tiedote" />

            <span className="lowercase">
              &nbsp;({translate(notificationValidationStateString)})
            </span>
          </TabItem>

          <TabItem
            name="edit-timeline"
            selectedTab={selectedTab}
            onClick={controller.toggleEditorTab}
          >
            <Translation trans="aikajana" />

            <span className="lowercase">
              &nbsp;({
                completeTimelineItems.length
                  ? completeTimelineItems.length
                  : translate('eisisaltoa')
              })
            </span>
          </TabItem>

          <TabItem
            name="targeting"
            selectedTab={selectedTab}
            onClick={controller.toggleEditorTab}
          >
            <Translation trans="kohdennus" />
          </TabItem>
        </Tabs>

        {/*Publication state*/}
        <div
          className="h5 caps muted md-flex flex-auto items-center justify-end
          mt2 md-mt0 md-border-bottom border-gray-lighten-2"
        >
          {translate('tila')}:&nbsp;{translate(notificationPublicationStateString)}
        </div>
      </div>

      {/*Edit and target content*/}
      <div className="tab-content px3">
        {/*Notification*/}
        <section className={`tab-pane ${selectedTab === 'edit-notification' ? 'tab-pane-is-active' : ''}`}>
          <EditNotification
            locale={locale}
            dateFormat={dateFormat}
            controller={controller}
            release={release}
            notificationTags={notificationTags}
          />
        </section>

        {/*Timeline*/}
        <section className={`tab-pane ${selectedTab === 'edit-timeline' ? 'tab-pane-is-active' : ''}`}>
          <EditTimeline
            locale={locale}
            dateFormat={dateFormat}
            controller={controller}
            release={release}
          />
        </section>

        {/*Categories and user groups*/}
        <section className={`tab-pane ${selectedTab === 'targeting' ? 'tab-pane-is-active' : ''}`}>
          <Targeting
            locale={locale}
            controller={controller}
            categories={categories}
            userGroups={userGroups}
            release={release}
          />
        </section>
      </div>

      {/*Preview*/}
      { isPreviewed
        ? <section className="pt3 px3 border-top border-gray-lighten-3">
          <PreviewRelease
            locale={locale}
            categories={categories}
            userGroups={userGroups}
            release={release}
          />
        </section>
        : null
      }

      {/*Form actions*/}
      <div className={`center relative pt3 px3 border-gray-lighten-3 ${isPreviewed ? '' : 'border-top'}`}>
        {/*Preview & publish*/}
        <Button
          className="button button-primary button-lg"
          type="submit"
          disabled={
            // Release is empty
            release.validationState === 'empty' ||
            // Release is incomplete
            release.validationState === 'incomplete' ||
            // Notification is empty and empty timeline items exist
            (notification.validationState === 'empty' && emptyTimelineItems.length === timeline.length) ||
            // Notification is incomplete
            notification.validationState === 'incomplete' ||
            // Incomplete timeline items exist
            incompleteTimelineItems.length
          }
          isLoading={false}
        >
          {isPreviewed ? translate('julkaise') : translate('esikatselejulkaise')}
        </Button>
      </div>
    </form>
  )
}

EditRelease.propTypes = propTypes

export default EditRelease
