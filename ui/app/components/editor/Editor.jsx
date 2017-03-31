import React, { PropTypes } from 'react'
import moment from 'moment'
import R from 'ramda'

import EditNotification from './EditNotification'
import EditTimeline from './EditTimeline'
import Targeting from './targeting/Targeting'
import PreviewRelease from './preview/PreviewRelease'
import ValidationMessages from './preview/ValidationMessages'
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
  user: PropTypes.object.isRequired,
  dateFormat: PropTypes.string.isRequired,
  editor: PropTypes.object.isRequired,
  userGroups: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  tagGroups: PropTypes.object.isRequired
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

const notificationValidationStateKeys = {
  'empty': 'eisisaltoa',
  'incomplete': 'kesken',
  'complete': 'taytetty'
}

const releaseValidationStateKeys = {
  'empty': 'eikohdennettu',
  'incomplete': 'eikohdennettu',
  'complete': 'valmis'
}

// TODO: Throttle onChange updates

function Editor (props) {
  const {
    controller,
    user,
    dateFormat,
    editor,
    userGroups,
    categories,
    tagGroups
  } = props

  const {
    alerts,
    selectedTab,
    editedRelease,
    isPreviewed,
    isLoadingRelease,
    isSavingRelease,
    hasSaveFailed,
    hasSaveDraftFailed,
    hasLoadingDependenciesFailed
  } = editor

  const notification = editedRelease.notification
  const timeline = editedRelease.timeline
  const emptyTimelineItems = getTimelineItems(['empty'], timeline)
  const incompleteTimelineItems = getTimelineItems(['incomplete'], timeline)
  const completeTimelineItems = getTimelineItems(['complete'], timeline)

  const notificationPublicationStateString = getNotificationPublicationStateString(notification.createdAt, dateFormat)

  const disruptionNotificationTag = R.find(R.propEq('type', 'DISRUPTION'))(tagGroups.specialTags)

  const handleSubmit = event => {
    event.preventDefault()

    if (isPreviewed) {
      controller.save(editedRelease.id)
    } else {
      controller.togglePreview(true)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      {/*Heading for screen readers*/}
      <h2 className="hide">{translate('muokkaasisaltoa')}</h2>

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

        {/*Publication state*/}
        <div
          className="h5 caps md-flex items-center justify-end md-col-4
          mt2 md-mt0 md-border-bottom border-gray-lighten-3"
        >
          {
            isLoadingRelease
              ? null
              : <div>
                <div className="md-right-align lg-inline-block muted">
                  {translate('tila')}:&nbsp;{translate(notificationPublicationStateString)}
                </div>

                {
                  hasSaveDraftFailed
                    ? <div className="lg-inline-block md-ml2 mt1 lg-mt0 red">{translate('tallennusepaonnistui')}</div>
                    : null
                }
              </div>
          }
        </div>
      </div>

      {/*Edit and target content*/}
      {
        hasLoadingDependenciesFailed
          ? <div className="py3" />
          : <div className="tab-content">
            {/*Notification*/}
            <section className={`tab-pane px3 ${selectedTab === 'edit-notification' ? 'tab-pane-is-active' : ''}`}>
              {
                isLoadingRelease ||
                categories.isLoadingRelease ||
                userGroups.isLoadingRelease ||
                tagGroups.isLoadingRelease
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
            </section>

            {/*Timeline*/}
            <section className={`tab-pane px3 ${selectedTab === 'edit-timeline' ? 'tab-pane-is-active' : ''}`}>
              {
                isLoadingRelease ||
                categories.isLoadingRelease ||
                userGroups.isLoadingRelease ||
                tagGroups.isLoadingRelease
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
            </section>

            {/*Categories and user groups*/}
            <section className={`tab-pane ${selectedTab === 'targeting' ? 'tab-pane-is-active' : ''}`}>
              {
                isLoadingRelease ||
                categories.isLoadingRelease ||
                userGroups.isLoadingRelease ||
                tagGroups.isLoadingRelease
                  ? <Delay time={1000}>
                    <Spinner isVisible />
                  </Delay>
                  : <Targeting
                    controller={controller.targeting}
                    user={user}
                    userGroups={userGroups.items}
                    categories={categories.items}
                    tagGroups={tagGroups.items}
                    release={editedRelease}
                  />
              }
            </section>
          </div>
      }

      {/*Preview*/}
      {
        isPreviewed
          ? <section className="py3 px3 border-top border-bottom border-gray-lighten-3">
            <PreviewRelease
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
      <div className={`center pt3 px3 border-gray-lighten-3 ${isPreviewed ? '' : 'border-top'}`}>
        {/*Validation messages*/}
        {
          isLoadingRelease || hasLoadingDependenciesFailed
            ? null
            : <ValidationMessages
              release={editedRelease}
              timeline={timeline}
              emptyTimelineItems={emptyTimelineItems}
              incompleteTimelineItems={incompleteTimelineItems}
              targetingGroups={R.pluck('name', user.targetingGroups)}
            />
        }

        {/*Preview & publish*/}
        <Button
          className="editor-button-save button button-primary button-lg"
          type="submit"
          disabled={
            isSavingRelease || isLoadingRelease ||
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
          isLoading={isSavingRelease}
        >
          {isPreviewed ? translate('julkaise') : translate('esikatselejulkaise')}
        </Button>
      </div>

      {
        hasSaveFailed
          ? <Popup
            target=".editor-button-save"
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
