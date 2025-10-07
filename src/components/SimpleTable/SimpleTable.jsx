import React from 'react'
import { Table } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'

export const SimpleTable = ({ columns = [], data = [] }) => {

  console.log({ data });

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
          {data.map(item => {
            return (<tr>
              {columns.map(col => {
                return (<td>{item[col.field]}</td>)
              })}
            </tr>)
          })}
        </tbody>
      </Table>
    </div>
  )
}
