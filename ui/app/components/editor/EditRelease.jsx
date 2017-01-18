import React, { PropTypes } from 'react'
import moment from 'moment'
import { Dropdown } from 'semantic-ui-react'

import Field from '../common/form/Field'
import Fieldset from '../common/form/Fieldset'
import Checkbox from '../common/form/Checkbox'
import CheckboxButtonGroup from '../common/form/CheckboxButtonGroup'
import Tabs from '../common/tabs/Tabs'
import TabItem from '../common/tabs/TabItem'
import Translation, { translate } from '../common/Translations'
import EditNotification from './EditNotification'
import EditTimeline from './EditTimeline'
import PreviewRelease from './PreviewRelease'

import getTimelineItems from './getTimelineItems'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  selectedTab: PropTypes.string.isRequired,
  isPreviewed: PropTypes.bool.isRequired,
  release: PropTypes.object.isRequired,
  notificationTags: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired
}

// Returns a string representing the notification's publication state
const getNotificationPublicationState = (initialDate, dateFormat) => {
  // No initialStartDate = a draft
  if (!initialDate) {
    return <Translation trans="luonnos" />
  }

  // initialStartDate is after today = unpublished
  if (moment(initialDate, dateFormat).isAfter(moment())) {
    return <Translation trans="julkaisematon" />
  }

  // initialStartDate is before today = published
  if (moment(initialDate, dateFormat).isBefore(moment())) {
    return <Translation trans="julkaistu" />
  }
}

// Returns a string representing the notification's validation state
const getNotificationValidationStateString = state => {
  if (state === 'empty') {
    return <Translation trans="eisisaltoa" />
  }

  if (state === 'incomplete') {
    return <Translation trans="kesken" />
  }

  if (state === 'complete') {
    return <Translation trans="valmis" />
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
    categories
  } = props

  const notification = release.notification
  const timeline = release.timeline
  const emptyTimelineItems = getTimelineItems(['empty'], timeline)
  const incompleteTimelineItems = getTimelineItems(['incomplete'], timeline)
  const completeTimelineItems = getTimelineItems(['complete'], timeline)

  const handleOnSubmit = event => {
    event.preventDefault()

    if (isPreviewed) {
      controller.saveDocument()
    } else {
      controller.toggleDocumentPreview(true)
    }
  }

  const handleOnSendEmailChange = () => {
    controller.updateRelease('sendEmail', !release.sendEmail)
  }

  // Set default release and notification validation states for unpublished/published releases
  release.validationState = release.id > 0
    ? release.validationState || 'complete'
    : release.validationState

  notification.validationState = notification.id > 0
    ? notification.validationState || 'complete'
    : notification.validationState

  return (
    <form noValidate onSubmit={handleOnSubmit}>
      <h2 className="hide"><Translation trans="lisaauusi" /></h2>

      {/*Tabs and release's state*/}
      <div className="flex flex-wrap px3">
        <Tabs className="col-12 sm-col-6">
          <TabItem
            name="edit-notification"
            selectedTab={selectedTab}
            onClick={controller.toggleEditorTab}
          >
            <Translation trans="tiedote" />

            <span className="lowercase">
              &nbsp;({getNotificationValidationStateString(notification.validationState)})
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
                  : <Translation trans="eisisaltoa" />
              })
            </span>
          </TabItem>
        </Tabs>

        {/*Publication state*/}
        <div
          className="h5 caps muted sm-flex flex-auto items-center justify-end
          mt2 sm-mt0 sm-border-bottom border-gray-lighten-2"
        >
          {translate('tila')}:&nbsp;{getNotificationPublicationState(notification.initialDate, dateFormat)}
        </div>
      </div>

      {/*Editor*/}
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
      </div>

      {/*Categories and user groups*/}
      <section className="py2 px3 border-top border-bottom border-gray-lighten-2">
        <h2 className="hide"><Translation trans="julkkategoriaryhma" /></h2>

        <div className="flex flex-wrap">
          {/*Categories*/}
          <div className="col-12 sm-col-6 sm-pr2">
            <Fieldset isRequired legend={<Translation trans="julkkategoria" />}>
              <CheckboxButtonGroup
                locale={locale}
                htmlId="category"
                options={categories}
                selectedOptions={release.categories}
                onChange={controller.toggleReleaseCategory}
              />
            </Fieldset>
          </div>

          {/*User groups*/}
          <div className="col-12 sm-col-6 sm-pl2">
            <Field name="release-usergroups" label={<Translation trans="julkryhma" />}>
              <Dropdown
                className="semantic-ui"
                fluid
                multiple
                name="release-usergroups"
                noResultsMessage={translate('eiryhma')}
                options={[]}
                placeholder={translate('lisaaryhma')}
                search
                selection
                value={[]}
              />
            </Field>

            <Checkbox
              name="release-send-email"
              label={<Translation trans="lahetasahkoposti" />}
              checked={release.sendEmail}
              onChange={handleOnSendEmailChange}
            />
          </div>
        </div>
      </section>

      {/*Preview*/}
      { isPreviewed
        ? <section className="p3 border-bottom border-gray-lighten-2">
          <PreviewRelease locale={locale} release={release} />
        </section>
        : null
      }

      {/*Form actions*/}
      <div className="center pt3 px3">
        <input
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
          value={isPreviewed ? translate('julkaise') : translate('esikatselejulkaise')}
        />
      </div>
    </form>
  )
}

EditRelease.propTypes = propTypes

export default EditRelease
