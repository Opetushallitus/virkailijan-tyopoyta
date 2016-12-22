import React from 'react'

function Button (props) {
  const {
    classList,
    ...rest
  } = props;

  return (
    <button className={`button ${classList}`} type="button" {...rest}>
      {props.children}
    </button>
  )
}

export default Button;
