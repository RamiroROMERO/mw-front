import React from 'react'
import { Table } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { SimpleTableTD } from './SimpleTableTD'

export const SimpleTable = ({ columns = [], data = [] }) => {

  return (
    <div className='mt-3 mb-3'>
      <Table bordered hover responsive>
        <thead>
          <tr>
            {columns.map(col => {
              return (<th style={{ width: `${col.width}%` }}>{IntlMessages(col.title)}</th>)
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            return (<tr id={`det-cot-${idx}`}>
              {columns.map(col => {
                return (<SimpleTableTD value={item[col.field]} formatTd={col} />)
              })}
            </tr>)
          })}
        </tbody>
      </Table>
    </div>
  )
}
