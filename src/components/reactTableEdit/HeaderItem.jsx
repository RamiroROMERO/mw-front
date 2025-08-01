import React from 'react'

export const HeaderItem = ({label, headerStyle}) => {
  return (
    <th 
      style={{...headerStyle}}> {label} </th>
  );
}
