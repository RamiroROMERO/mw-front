import React from 'react'
import { Input } from 'reactstrap';

export const RowItem = ({value, isEditable=false, inputId, inputName, handleChange, style}) => {
  return (
    <td style={{...style, padding:'0.2rem', wordWrap: 'break-word'}}>
      {isEditable? <Input
        bsSize="sm" 
        type='text'
        value={value}
        name={inputName}
        id={inputId}
        onChange={handleChange}
      />: value}
      {}
    </td>
  )
}
