import React, { PropTypes } from 'react'

let translations = []

export function setTranslations (list) {
  translations = list
}

export function translate (keyValue) {
  let trans = translations.find(({key}) => key === keyValue)
  return trans ? trans.value : keyValue
}

const propTypes = {
  trans: PropTypes.string.isRequired
}

export default function Translation (props) {
  return <span>{translate(props.trans)}</span>
}

Translation.propTypes = propTypes
