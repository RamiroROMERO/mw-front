import React from 'react'
import { RowItem } from './RowItem'

export const RowTable = ({row={}, columns=[], editables = [], styleColumns=[], handleChange}) => {
  const rowId=row.id;
  return (
    <tr>
      {
        columns.map((name, key)=>{
          const valueItem = typeof row[name] === 'object'?'':row[name];
          const inputId = `${name}-${rowId}`;
          return (
            <RowItem
              key={key} 
              value={valueItem}
              isEditable={editables[key]}
              style={styleColumns[key]}
              inputId={inputId}
              inputName={name}
              handleChange={handleChange}
            />
          )
        })
      }
    </tr>
  )
}
