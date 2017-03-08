import R from 'ramda'

// Validation checks
const isNotEmpty = value => value.length > 0
const isNotNull = value => value !== null

// Validation rules
export function rules (state) {
  return {
    release: {
      userGroups: isNotEmpty,
      'notification.tags': value => {
        return state.notification.validationState !== 'empty' ? isNotEmpty(value) : null
      }
    },
    notification: {
      'content.fi.title': isNotEmpty,
      'content.fi.text': isNotEmpty,
      startDate: isNotNull
    },
    timelineItem: {
      'content.fi.text': isNotEmpty,
      date: isNotNull
    }
  }
}

// Returns the validated object with a 'validationState' property with value representing the validation result
export function validate (state, rules) {
  const values = []
  let result

  // Check each rule
  R.forEachObjIndexed((value, key) => {
    const path = key.split('.')
    const prop = R.path(path, state)

    if (R.isNil(value(prop))) {
      return
    }

    values.push(value(prop))
  }, rules)

  if (R.all(R.equals(false))(values)) {
    // All values are false
    result = 'empty'
  } else if (R.all(R.equals(true))(values)) {
    // All values are true
    result = 'complete'
  } else {
    result = 'incomplete'
  }

  return R.assoc(
    'validationState',
    result,
    state
  )
}
