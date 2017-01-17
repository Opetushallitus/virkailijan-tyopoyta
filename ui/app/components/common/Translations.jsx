import React from 'react'

const instances = new Set()
let translations

export default class Translation extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  componentWillMount () {
    if (translations) {
      this.setTranslation(translations)
    } else {
      instances.add(this)
    }
  }

  componentWillUnmount () {
    instances.delete(this)
  }

  setTranslation (translations) {
    this.setState({
      value: translate(this.props.trans)
    })
  }

  render () {
    return <span>{this.state.value}</span>
  }
}

Translation.setTranslations = function (list) {
  translations = list
  instances.forEach(instance => instance.setTranslation(translations))
}

Translation.propTypes = {
  trans: React.PropTypes.string.isRequired
}

export function translate (keyValue) {
  if (translations) {
    var trans = translations.find(({key}) => key === keyValue)
  }

  return trans ? trans.value : keyValue
}
