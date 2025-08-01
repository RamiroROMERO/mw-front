import React from 'react'

export default (props) => {
  const {children} = props;
  return (
    <div {...props}>{children}</div>
  )
};