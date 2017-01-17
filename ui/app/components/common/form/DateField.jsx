import React, { PropTypes } from 'react'
import moment from 'moment'

import DatePicker from 'react-datepicker'
import Field from './Field'

const propTypes = {
  datePickerClassName: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  name: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  locale: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  date: PropTypes.string,
  minDate: PropTypes.object,
  selectsStart: PropTypes.bool,
  selectsEnd: PropTypes.bool,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  popoverAttachment: PropTypes.string,
  popoverTargetAttachment: PropTypes.string,
  onChange: PropTypes.func.isRequired
}

const defaultProps = {
  datePickerClassName: '',
  isRequired: false,
  date: null,
  minDate: null,
  startDate: null,
  endDate: null,
  popoverAttachment: 'top left',
  popoverTargetAttachment: 'bottom left',
  selectsStart: false,
  selectsEnd: false
}

function DateField (props) {
  const {
    datePickerClassName,
    label,
    name,
    isRequired,
    locale,
    dateFormat,
    date,
    minDate,
    selectsStart,
    selectsEnd,
    startDate,
    endDate,
    popoverAttachment,
    popoverTargetAttachment,
    onChange
  } = props

  return (
    <Field
      name={name}
      label={label}
      isRequired={isRequired}
    >
      <DatePicker
        className={`input ${datePickerClassName}`}
        minDate={minDate}
        fixedHeight
        dateFormat={dateFormat}
        highlightDates={[new Date()]}
        isClearable
        locale={locale}
        onChange={onChange}
        placeholderText="p.k.vvvv"
        selected={date ? moment(date, dateFormat) : null}
        selectsStart={selectsStart}
        selectsEnd={selectsEnd}
        startDate={moment(startDate, dateFormat)}
        endDate={moment(endDate, dateFormat)}
        showMonthDropdown
        popoverAttachment={popoverAttachment}
        popoverTargetAttachment={popoverTargetAttachment}
      />
    </Field>
  )
}

DateField.propTypes = propTypes
DateField.defaultProps = defaultProps

export default DateField
