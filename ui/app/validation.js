import R from 'ramda'

// Validation checks
const isNotEmpty = value => value.length > 0
const isNotNull = value => value !== null

// Validation rules
export const rules = {
  release: {
    categories: isNotEmpty
  },
  notification: {
    'content.fi.title': isNotEmpty,
    'content.fi.text': isNotEmpty,
    tags: isNotEmpty,
    startDate: isNotNull
  },
  timelineItem: {
    'content.fi.text': isNotEmpty,
    date: isNotNull
  }
}

// Returns a string representing editor's validation state
export function validate (state, rules) {
  const values = []
  let result

  // Check each rule
  R.forEachObjIndexed((value, key) => { 
    const path = key.split('.')
    const prop = R.path(path, state)

    values.push(value(prop))
  }, rules)

  // All values are false
  if (R.all(R.equals(false))(values)) {
    result = 'empty'
  }
  // All values are true
  else if (R.all(R.equals(true))(values)) {
    result = 'complete'
  }
  else {
    result = 'incomplete'
  }

  return R.assoc(
    'validationState',
    result,
    state
  )
}

function validateRelease (release, prop, value) {
  const validationRules = {
    'categories': {
      state: R.propSatisfies(
        value => value.length > 0,
        'categories',
        release
      ),
      message: 'Valitse vähintään yksi kategoria'
    }
  }

  const key = 'release'
  const path = ['release', prop, 'state']

  const newState = R.assocPath(
    path,
    rules[key][prop].rule(value),
    rules
  )

  console.log(newState)

  return R.assoc(
    'validationState',
    R.all(R.propEq('state', true))(R.values(newState[key])) ? 'valid' : 'invalid',
    release
  )
}

function validateNotification (notification) {
  const validationRules = {
    'content.fi.title': {
      state: R.pathSatisfies(
        value => value !== '',
        ['content', 'fi', 'title'],
        notification
      ),
      message: 'Otsikko on pakollinen'
    },
    'content.fi.text': {
      state: R.pathSatisfies(
        value => value !== '',
        ['content', 'fi', 'text'],
        notification
      ),
      message: 'Kuvaus on pakollinen'
    },
    'tags': {
      state: R.propSatisfies(
        value => value.length > 0,
        'tags',
        notification
      ),
      message: 'Valitse vähintään yksi avainsana'
    },
    'startDate': {
      state: R.propSatisfies(
        value => { return R.not(R.isNil(value)) },
        'startDate',
        notification
      ),
      message: 'Anna päivämäärä muodossa p.k.vvvv'
    }
  }

  return R.assoc(
    'validationState',
    getValidationState(validationRules),
    notification
  )
}

function validateTimelineItem (item) {
  const validationRules = {
    'content.fi.text': {
      state: R.pathSatisfies(
        value => value !== '',
        ['content', 'fi', 'text'],
        item
      ),
      message: 'Kuvaus on pakollinen'
    },
    'date': {
      state: R.propSatisfies(
        value => { return R.not(R.isNil(value)) },
        'date',
        item
      ),
      message: 'Anna päivämäärä muodossa p.k.vvvv'
    }
  }

  return R.assoc(
    'validationState',
    getValidationState(validationRules),
    item
  )
}
