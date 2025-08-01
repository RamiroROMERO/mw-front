import React from 'react'
import { RowTable } from './RowTable'

export const BodyTable = ({data=[], nameColumns=[], editableColumns=[], styleColumns=[], handleChange}) => {
  // console.log("BodyTable", nameColumns);
  return (
    <tbody>
      {data.map((elem, key)=>{
        return(
          <RowTable
            key={key}
            row={elem}
            columns={nameColumns}
            editables={editableColumns}
            styleColumns={styleColumns}
            handleChange={handleChange}/>
        )
      })}
    </tbody>
  )
}
