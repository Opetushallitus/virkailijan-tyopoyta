import React, { PropTypes } from 'react'
import moment from 'moment'
import R from 'ramda'

import EditNotification from './EditNotification'
import EditTimeline from './EditTimeline'
import PreviewAndReleaseButton from './PreviewAndReleaseButton'
import Targeting from './targeting/Targeting'
import Preview from './preview/Preview'
import ValidationMessages from './preview/ValidationMessages'
import Tabs from '../common/tabs/Tabs'
import TabItem from '../common/tabs/TabItem'
import TabContent from '../common/tabs/TabContent'
import TabPane from '../common/tabs/TabPane'
import Alert from '../common/Alert'
import Delay from '../common/Delay'
import Spinner from '../common/Spinner'
import { translate } from '../common/Translations'

import getTimelineItems from './getTimelineItems'

const propTypes = {
  controller: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  dateFormat: PropTypes.string.isRequired,
  editor: PropTypes.object.isRequired,
  userGroups: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  tagGroups: PropTypes.object.isRequired,
  targetingGroups: PropTypes.object.isRequired
}

// Returns a translation key representing the notification's publication state
const getNotificationPublishingStateString = (createdAt, dateFormat) => {
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

const notificationValidationStateKeys = {
  empty: 'eisisaltoa',
  incomplete: 'kesken',
  complete: 'taytetty'
}

const releaseValidationStateKeys = {
  empty: 'eikohdennettu',
  incomplete: 'eikohdennettu',
  complete: 'valmis'
}

function Editor (props) {
  const {
    controller,
    user,
    dateFormat,
    editor,
    userGroups,
    categories,
    tagGroups,
    targetingGroups
  } = props

  const {
    alerts,
    selectedTab,
    editedRelease,
    isPreviewed,
    isLoadingRelease,
    isSavingRelease,
    hasSaveFailed,
    hasLoadingDependenciesFailed
  } = editor

  const notification = editedRelease.notification
  const timeline = editedRelease.timeline
  const emptyTimelineItems = getTimelineItems(['empty'], timeline)
  const incompleteTimelineItems = getTimelineItems(['incomplete'], timeline)
  const completeTimelineItems = getTimelineItems(['complete'], timeline)

  const notificationPublishingStateString = getNotificationPublishingStateString(notification.createdAt, dateFormat)

  const disruptionNotificationTag = R.find(R.propEq('type', 'DISRUPTION'))(tagGroups.specialTags)

  const handleSubmit = event => {
    event.preventDefault()

    if (isPreviewed) {
      document.querySelector('#editor-button-save').setAttribute('disabled', true)

      controller.save(editedRelease.id)
    } else {
      controller.togglePreview(true)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      {/*Alerts*/}
      <div className={`my3 ${alerts.length > 0 ? '' : 'display-none'}`}>
        {alerts.map(alert =>
          <Alert
            key={`editorAlert${alert.id}`}
            id={alert.id}
            variant={alert.variant}
            titleKey={alert.titleKey}
            textKey={alert.textKey}
            onCloseButtonClick={controller.removeAlert}
          />
        )}
      </div>

      {/*Tabs and notifications' state*/}
      <div className="md-flex flex-wrap px3">
        <div className="flex flex-wrap md-col-8 mb0">
          <Tabs>
            <TabItem
              name="edit-notification"
              selectedTab={selectedTab}
              onClick={controller.toggleTab}
            >
              {translate('tiedote')}

              {
                isLoadingRelease
                  ? null
                  : <span className="lowercase">
                    &nbsp;({translate(notificationValidationStateKeys[notification.validationState])})
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
                isLoadingRelease
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

              {
                isLoadingRelease
                  ? null
                  : <span className="lowercase">
                    &nbsp;({translate(releaseValidationStateKeys[editedRelease.validationState])})
                  </span>
              }
            </TabItem>
          </Tabs>
        </div>

        {/*Publishing state*/}
        <div className="oph-h5 caps md-flex items-center justify-end md-col-4 mt2 md-mt0 md-border-bottom">
          {
            isLoadingRelease
              ? null
              : <div className="oph-muted md-right-align lg-inline-block">
                {translate('tila')}:&nbsp;{translate(notificationPublishingStateString)}
              </div>
          }
        </div>
      </div>

      {/*Edit and target content*/}
      {
        hasLoadingDependenciesFailed
          ? <div className="py3" />
          : <TabContent>
            {/*Notification*/}
            <div className="px3">
              <TabPane name="edit-notification" isActive={selectedTab === 'edit-notification'}>
                {
                  isLoadingRelease ||
                  categories.isLoading ||
                  userGroups.isLoading ||
                  tagGroups.isLoading
                    ? <Delay time={1000}>
                      <Spinner isVisible />
                    </Delay>
                    : <EditNotification
                      locale={user.lang}
                      dateFormat={dateFormat}
                      controller={controller.editNotification}
                      notification={editedRelease.notification}
                      disruptionNotificationTag={disruptionNotificationTag}
                    />
                }
              </TabPane>
            </div>

            {/*Timeline*/}
            <div className="px3">
              <TabPane name="edit-timeline" isActive={selectedTab === 'edit-timeline'}>
                {
                  isLoadingRelease ||
                  categories.isLoading ||
                  userGroups.isLoading ||
                  tagGroups.isLoading
                    ? <Delay time={1000}>
                      <Spinner isVisible />
                    </Delay>
                    : <EditTimeline
                      locale={user.lang}
                      dateFormat={dateFormat}
                      controller={controller.editTimeline}
                      releaseId={editedRelease.id}
                      timeline={editedRelease.timeline}
                    />
                }
              </TabPane>
            </div>

            {/*Categories and user groups*/}
            <TabPane name="targeting" isActive={selectedTab === 'targeting'}>
              {
                isLoadingRelease ||
                categories.isLoading ||
                userGroups.isLoading ||
                tagGroups.isLoading
                  ? <Delay time={1000}>
                    <Spinner isVisible />
                  </Delay>
                  : <Targeting
                    controller={controller.targeting}
                    user={user}
                    userGroups={userGroups.items}
                    categories={categories.items}
                    tagGroups={tagGroups.items}
                    targetingGroups={targetingGroups}
                    release={editedRelease}
                  />
              }
            </TabPane>
          </TabContent>
      }

      {/*Preview*/}
      {
        isPreviewed
          ? <section className="py3 px3 border-top border-bottom" data-selenium-id="editor-preview">
            <Preview
              locale={user.lang}
              categories={categories.items}
              userGroups={userGroups.items}
              tagGroups={tagGroups.items}
              release={editedRelease}
            />
          </section>
          : null
      }

      {/*Form actions*/}
      <div className={`editor-actions ${isPreviewed ? '' : 'border-top'}`}>
        {/*Validation messages*/}
        {
          isLoadingRelease || hasLoadingDependenciesFailed
            ? null
            : <ValidationMessages
              release={editedRelease}
              timeline={timeline}
              emptyTimelineItems={emptyTimelineItems}
              incompleteTimelineItems={incompleteTimelineItems}
              targetingGroups={R.pluck('name', targetingGroups.items)}
            />
        }

        {/*Preview & publish*/}
        <PreviewAndReleaseButton
          disabled={
            isSavingRelease || isLoadingRelease ||
            // Release isn't targeted or tags aren't selected
            editedRelease.validationState === 'empty' || editedRelease.validationState === 'incomplete' ||
            // Notification is empty and empty timeline items exist
            (notification.validationState === 'empty' && emptyTimelineItems.length === timeline.length) ||
            // Notification is incomplete
            notification.validationState === 'incomplete' ||
            // Incomplete timeline items exist
            incompleteTimelineItems.length > 0
          }
          isLoading={isSavingRelease}
          text={isPreviewed ? translate('julkaise') : translate('esikatselejulkaise')}
          hasSaveFailed={hasSaveFailed}
          onOutsidePopupClick={controller.toggleHasSaveFailed}
        />
      </div>
    </form>
  )
}

Editor.propTypes = propTypes

export default Editor
