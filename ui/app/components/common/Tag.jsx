import React, { PropTypes } from 'react'

const propTypes = {
  variant: PropTypes.string,
  text: PropTypes.string.isRequired
}

const defaultProps = {
  variant: null
}

function Tag (props) {
  const {
    variant
  } = props

  return (
    <span className={`tag ${variant ? `tag-${variant}` : ''}`}>
      {props.text}
    </span>
  )
}

Tag.propTypes = propTypes
Tag.defaultProps = defaultProps

export default Tag
