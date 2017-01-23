import React, { PropTypes } from 'react'
import moment from 'moment'
import DatePicker from 'react-datepicker'

import Field from './Field'
import { translate } from '../Translations'

const propTypes = {
  fieldClassName: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  labelIsHidden: PropTypes.bool,
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
  placeholderText: PropTypes.string,
  popoverAttachment: PropTypes.string,
  popoverTargetAttachment: PropTypes.string,
  onChange: PropTypes.func.isRequired
}

const defaultProps = {
  fieldClassName: '',
  isRequired: false,
  labelIsHidden: false,
  date: null,
  minDate: null,
  startDate: null,
  endDate: null,
  placeholderText: translate('paivamaaraplaceholder'),
  popoverAttachment: 'top left',
  popoverTargetAttachment: 'bottom left',
  selectsStart: false,
  selectsEnd: false
}

function DateField (props) {
  const {
    fieldClassName,
    label,
    labelIsHidden,
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
    placeholderText,
    popoverAttachment,
    popoverTargetAttachment,
    onChange
  } = props

  return (
    <Field
      className={fieldClassName}
      name={name}
      label={label}
      labelIsHidden={labelIsHidden}
      isRequired={isRequired}
    >
      <DatePicker
        className="input"
        minDate={minDate}
        fixedHeight
        dateFormat={dateFormat}
        highlightDates={[new Date()]}
        isClearable
        locale={locale}
        onChange={onChange}
        placeholderText={placeholderText}
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
