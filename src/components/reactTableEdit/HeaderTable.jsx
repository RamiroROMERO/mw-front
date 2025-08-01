import React from 'react'
import { IntlMessages } from '@/helpers/Utils';
import { HeaderItem } from './HeaderItem'

export const HeaderTable = ({columns=[]}) => {
  return (
    <thead>
      <tr>
      {columns.map((elem, key)=>{
        return(
          <HeaderItem key={key} label={IntlMessages(elem.label)} headerStyle={elem.headerStyle}/>
        )
      })}
      </tr>
    </thead>
  )
}
