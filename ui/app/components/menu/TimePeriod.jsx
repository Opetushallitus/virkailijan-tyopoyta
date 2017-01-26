import React, { PropTypes } from 'react'
import moment from 'moment'

import DateField from '../common/form/DateField'
import { translate } from '../common/Translations'

const propTypes = {
  controller: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string
}

const defaultProps = {
  startDate: null,
  endDate: null
}

function TimePeriod (props) {
  const {
    controller,
    locale,
    dateFormat,
    startDate,
    endDate
  } = props

  /*
   Updates startDate
   Updates endDate if startDate > endDate
   */
  const handleOnStartDateChange = date => {
    const newDate = date ? moment(date).format(dateFormat) : null

    controller.updateView('startDate', newDate)

    // Update endDate if it's before startDate
    if (newDate && date.isAfter(moment(endDate, dateFormat))) {
      controller.updateView('endDate', newDate)
    }
  }

  /*
   Updates endDate
   Updates startDate if endDate < startDate
   */
  const handleOnEndDateChange = date => {
    const newDate = date ? moment(date).format(dateFormat) : null

    controller.updateView('endDate', newDate)

    // No need to update startDate if endDate is null
    if (!newDate) {
      return
    }

    // Update startDate if it's before endDate
    if (newDate && date.isBefore(moment(startDate, dateFormat))) {
      controller.updateView('startDate', newDate)
    }
  }

  const monthAndYear = 'MMMM YYYY'
  const startDateMonthAndYear = startDate ? moment(startDate, dateFormat).format(monthAndYear) : null
  const endDateMonthAndYear = endDate ? moment(endDate, dateFormat).format(monthAndYear) : null

  return (
    <div>
      <div className="inline-block lg-inline md-col-1 mb1 md-mb0">
        {translate('aikavali')}
      </div>

      <div className="md-inline-block flex justify-center items-center md-col-9 lg-ml2">
        {/*Start date*/}
        <div className="md-inline-block col-6 sm-col-4 md-col-3 lg-col-5 pr1">
          <DateField
            fieldClassName="mb0"
            label={translate('alkaen')}
            labelIsHidden
            name="start-date"
            locale={locale}
            dateFormat={monthAndYear}
            date={startDateMonthAndYear}
            placeholderText={translate('alkaen')}
            onChange={handleOnStartDateChange}
          />
        </div>

        <span className="muted" aria-hidden>–</span>

        {/*End date*/}
        <div className="md-inline-block col-6 sm-col-4 md-col-3 lg-col-5 pl1">
          <DateField
            fieldClassName="mb0"
            label={translate('loppuen')}
            labelIsHidden
            name="end-date"
            locale={locale}
            dateFormat={monthAndYear}
            date={endDateMonthAndYear}
            placeholderText={translate('loppuen')}
            onChange={handleOnEndDateChange}
          />
        </div>
      </div>
    </div>
  )
}

TimePeriod.propTypes = propTypes
TimePeriod.defaultProps = defaultProps

export default TimePeriod
