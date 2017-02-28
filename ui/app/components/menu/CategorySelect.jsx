import React, { PropTypes } from 'react'
import { Dropdown } from 'semantic-ui-react'

import { translate } from '../common/Translations'

import mapDropdownOptions from '../utils/mapDropdownOptions'

const propTypes = {
  prop: PropTypes.String.isRequired
}

const defaultProps = {
}

function CategorySelect (props) {
  const {
    prop
  } = props

  return (
    <div prop={prop} />
  )
}

StatelessComponent.propTypes = propTypes
StatelessComponent.defaultProps = defaultProps

export default StatelessComponent
