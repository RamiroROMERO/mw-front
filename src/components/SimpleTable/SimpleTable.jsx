import { Table } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { SimpleTableTD } from './SimpleTableTD'

export const SimpleTable = ({ columns = [], data = [] }) => {

  return (
    <div className='mt-3 mb-3'>
      <Table bordered hover responsive>
        <thead>
          <tr>
            {columns.map(col => {
              return (<th key={col.field} scope="col" style={{ width: `${col.width}%` }}>{IntlMessages(col.title)}</th>)
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            return (<tr key={`det-cot-${idx}`} id={`det-cot-${idx}`}>
              {columns.map(col => {
                return (<SimpleTableTD key={col.field} value={item[col.field]} formatTd={col} />)
              })}
            </tr>)
          })}
        </tbody>
      </Table>
    </div>
  )
}
