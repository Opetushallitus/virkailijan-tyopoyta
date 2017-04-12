import React, { PropTypes } from 'react'
import moment from 'moment'

import TextEditor from './texteditor/TextEditor'
import Field from '../common/form/Field'
import DateField from '../common/form/DateField'
import LimitedTextField from '../common/form/LimitedTextField'
import Checkbox from '../common/form/Checkbox'
import { translate } from '../common/Translations'

import getFormattedDate from './getFormattedDate'

const propTypes = {
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  controller: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  disruptionNotificationTag: PropTypes.object.isRequired
}

function EditNotification (props) {
  const {
    locale,
    dateFormat,
    controller,
    notification,
    disruptionNotificationTag
  } = props

  const content = notification.content

  // Add 2 hours for first days of months, otherwise the previous months' last days are also selectable
  const minDate = moment().add(2, 'hours')

  const handleIsDisruptionNotificationCheckboxChange = () => {
    controller.setAsDisruptionNotification(disruptionNotificationTag.id)
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
      <h2 className="hide">{translate('tiedote')}</h2>

      {/*Title*/}
      <div className="flex flex-wrap mb2">
        <div className="col-12 sm-col-6 sm-pr2 mb2 sm-mb0">
          <LimitedTextField
            label={translate('otsikko')}
            name="notification-title-fi"
            value={content.fi.title}
            maxLength={200}
            isRequired
            onChange={controller.updateContent('fi', 'title')}
          />
        </div>

        <div className="col-12 sm-col-6 sm-pl2 mb2 sm-mb0">
          <LimitedTextField
            label={translate('otsikkoSV')}
            name="notification-title-sv"
            value={content.sv.title}
            maxLength={200}
            onChange={controller.updateContent('sv', 'title')}
          />
        </div>

        <div className="mt2">
          <Checkbox
            label={translate('hairiotiedote')}
            onChange={handleIsDisruptionNotificationCheckboxChange}
            checked={notification.tags.indexOf(disruptionNotificationTag.id) > -1}
            value={disruptionNotificationTag.id}
          />
        </div>
      </div>

      {/*Description*/}
      <div className="flex flex-wrap mb2">
        <div className="col-12 sm-col-6 sm-pr2 mb2 sm-mb0" data-selenium-id="notification-description-fi">
          <Field
            label={translate('kuvaus')}
            name="notification-description-fi"
            isRequired
          >
            <TextEditor
              data={content.fi.text}
              controls={['unordered-list-item', 'ordered-list-item', 'BOLD', 'ITALIC', 'UNDERLINE']}
              save={controller.updateContent('fi', 'text')}
            />
          </Field>
        </div>

        <div className="col-12 sm-col-6 sm-pl2" data-selenium-id="notification-description-sv">
          <Field
            label={translate('kuvausSV')}
            name="notification-description-sv"
          >
            <TextEditor
              data={content.sv.text}
              controls={['unordered-list-item', 'ordered-list-item', 'BOLD', 'ITALIC', 'UNDERLINE']}
              save={controller.updateContent('sv', 'text')}
            />
          </Field>
        </div>
      </div>

      {/*Publishing period*/}
      <div className="md-flex flex-wrap col-12 sm-col-6">
        <div className="md-col-6 lg-col-5 md-pr2 mb2 md-mb0">
          {/*Publish date*/}
          <DateField
            label={translate('julkaisupvm')}
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
            label={translate('poistumispvm')}
            name="notification-end-date"
            locale={locale}
            dateFormat={dateFormat}
            date={notification.endDate}
            minDate={minDate}
            selectsEnd
            startDate={notification.startDate}
            endDate={notification.endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>
    </div>
  )
}

EditNotification.propTypes = propTypes

export default EditNotification
