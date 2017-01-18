// Returns formatted date or null
const getFormattedDate = options => {
  const {
    date,
    minDate,
    dateFormat
  } = options

  if (date) {
    // React DatePicker allows selecting invalid dates (before minDate) with keyboard, force minDate to prevent it
    return minDate && date.isBefore(minDate)
      ? minDate.format(dateFormat)
      : date.format(dateFormat)
  } else {
    return null
  }
}

export default getFormattedDate
