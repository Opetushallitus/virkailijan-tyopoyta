import React, { PropTypes } from 'react'

let translations = []

const propTypes = {
  key: PropTypes.string.isRequired
}

export function setTranslations (data) {
  translations = data
}

// Returns a translation object's value or the keyValue, if no object has a matching key
export function translate (keyValue) {
  const translation = translations.find(({ key }) => key === keyValue)

  return translation ? translation.value : keyValue
}

function Translation (props) {
  return <span>{translate(props.key)}</span>
}

Translation.propTypes = propTypes

export default Translation
