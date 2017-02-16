import React, { PropTypes } from 'react'
import moment from 'moment'
import { Dropdown } from 'semantic-ui-react'

import Field from '../common/form/Field'
import DateField from '../common/form/DateField'
import LimitedTextField from '../common/form/LimitedTextField'
import Translation, { translate } from '../common/Translations'
import TextEditor from '../texteditor/TextEditor'

import getFormattedDate from './getFormattedDate'
import mapDropdownOptions from '../utils/mapDropdownOptions'

const propTypes = {
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  release: PropTypes.object.isRequired,
  notificationTags: PropTypes.array.isRequired
}

function EditNotification (props) {
  const {
    locale,
    dateFormat,
    controller,
    release,
    notificationTags
  } = props

  const notification = release.notification

  // Handle non-existing language properties in notification.content
  const contentFi = notification.content.fi || {}
  const contentSv = notification.content.sv || {}

  // Add 2 hours for first days of months, otherwise the previous months' last days are also selectable
  const minDate = moment().add(2, 'hours')

  const handleTagsChange = (event, { value }) => {
    controller.updateTags(value)
  }

  const handleTagClick = (event, { value }) => {
    controller.updateTags(value)
  }

  /*
    Updates startDate
    Updates endDate if startDate > endDate
  */
  const handleStartDateChange = date => {
    const newDate = getFormattedDate({ date, minDate, dateFormat })

    controller.update('startDate', newDate)

    // Update endDate if it's before startDate
    if (newDate && date.isAfter(moment(notification.endDate, dateFormat))) {
      controller.update('endDate', newDate)
    }
  }

  /*
    Updates endDate
    Updates startDate if endDate < startDate
  */
  const handleEndDateChange = date => {
    const newDate = getFormattedDate({ date, minDate, dateFormat })

    controller.update('endDate', newDate)

    // No need to update startDate if endDate is null
    if (!newDate) {
      return
    }

    // Update startDate if it's before endDate
    if (newDate && date.isBefore(moment(notification.startDate, dateFormat))) {
      controller.update('startDate', newDate)
    }
  }

  return (
    <div>
      <h3 className="hide">
        <Translation trans="muokkaatiedotteita" />
      </h3>

      {/*Title*/}
      <div className="flex flex-wrap">
        <div className="col-12 sm-col-6 sm-pr2">
          <LimitedTextField
            label={<Translation trans="otsikko" />}
            name="notification-title-fi"
            value={contentFi.title}
            maxLength={200}
            isRequired
            onChange={controller.updateContent('fi', 'title')}
          />
        </div>

        <div className="col-12 sm-col-6 sm-pl2">
          <LimitedTextField
            label={<Translation trans="otsikkoSV" />}
            name="notification-title-sv"
            value={contentSv.title}
            maxLength={200}
            onChange={controller.updateContent('sv', 'title')}
          />
        </div>

        {/*<Checkbox className="mb2" label="Häiriötiedote" />*/}
      </div>

      {/*Description*/}
      <div className="flex flex-wrap">
        <div className="col-12 sm-col-6 sm-pr2">
          <Field
            label={<Translation trans="kuvaus" />}
            name="notification-description-fi"
            isRequired
          >
            <TextEditor
              data={contentFi.text}
              controls={['unordered-list-item', 'ordered-list-item', 'BOLD', 'ITALIC', 'UNDERLINE']}
              save={controller.updateContent('fi', 'text')}
            />
          </Field>
        </div>

        <div className="col-12 sm-col-6 sm-pl2">
          <Field
            label={<Translation trans="kuvausSV" />}
            name="notification-description-sv"
          >
            <TextEditor
              data={contentSv.text}
              controls={['unordered-list-item', 'ordered-list-item', 'BOLD', 'ITALIC', 'UNDERLINE']}
              save={controller.updateContent('sv', 'text')}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap">
        {/*Tags*/}
        <div className="col-12 sm-col-6 sm-pr2">
          <Field
            label={<Translation trans="tiedotteenavainsanat" />}
            name="notification-tags"
            isRequired
          >
            <Dropdown
              className="semantic-ui"
              fluid
              multiple
              name="notification-tags"
              noResultsMessage={translate('eiavainsanoja')}
              onChange={handleTagsChange}
              onLabelClick={handleTagClick}
              options={mapDropdownOptions(notificationTags, locale)}
              placeholder={translate('lisaaavainsanoja')}
              search
              selection
              value={release.notification.tags}
            />
          </Field>
        </div>

        {/*Publishing period*/}
        <div className="md-flex flex-wrap col-12 sm-col-6 sm-pl2">
          <div className="md-col-6 lg-col-5 md-pr2">
            {/*Publish date*/}
            <DateField
              label={<Translation trans="julkaisupvm" />}
              name="notification-start-date"
              locale={locale}
              dateFormat={dateFormat}
              date={notification.startDate}
              minDate={minDate}
              selectsStart
              startDate={notification.startDate}
              endDate={notification.endDate}
              isRequired
              onChange={handleStartDateChange}
            />
          </div>

          <div className="md-col-6 lg-col-5 md-pl2">
            {/*Expiry date*/}
            <DateField
              label={<Translation trans="poistumispvm" />}
              name="notification-end-date"
              locale={locale}
              dateFormat={dateFormat}
              date={notification.endDate}
              minDate={minDate}
              selectsEnd
              startDate={notification.startDate}
              endDate={notification.endDate}
              popoverAttachment="top right"
              popoverTargetAttachment="bottom right"
              onChange={handleEndDateChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

EditNotification.propTypes = propTypes

export default EditNotification
