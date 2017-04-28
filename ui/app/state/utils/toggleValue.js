import R from 'ramda'

// Remove or concatenate values depending if the values are already selected
export default function toggleValue (value, values) {
  let newValues

  R.contains(value, values)
    ? newValues = R.reject(val => val === value, values)
    : newValues = R.concat(values, value)

  return newValues
}
