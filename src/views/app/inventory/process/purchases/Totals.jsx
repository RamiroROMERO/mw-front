import React from 'react'
import { Row, Table } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { formatNumber, IntlMessages } from '@/helpers/Utils'

const Totals = ({valueSubtotal, valueDiscount, exent, exonera, gravado, valueTax, freight, otherCharges, valueTotal, bonification}) => {
  return (
    <Row className='mt-3'>
      <Colxx xxs="12">
        <Table bordered hover size='sm'>
          <thead>
            <tr>
              <th>{IntlMessages("page.purchases.table.subtotal")}</th>
              <th className = 'd-sm-none-table-cell'>{IntlMessages("page.purchases.table.discount")}</th>
              <th className = 'd-md-none-table-cell'>{IntlMessages("page.purchases.table.exempt")}</th>
              <th className = 'd-md-none-table-cell'>{IntlMessages("page.purchases.table.exonerated")}</th>
              <th className = 'd-md-none-table-cell'>{IntlMessages("page.purchases.table.taxed")}</th>
              <th>{IntlMessages("page.purchases.table.taxes")}</th>
              <th className = 'd-sm-none-table-cell'>{IntlMessages("page.purchases.table.totalFreight")}</th>
              <th className = 'd-sm-none-table-cell'>{IntlMessages("page.purchases.table.totalCharges")}</th>
              <th>{IntlMessages("page.invoicing.input.total")}</th>
              <th className = 'd-sm-none-table-cell'>{IntlMessages("page.purchases.table.totalBonification")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td align='right'>{formatNumber(valueSubtotal)}</td>
              <td className = 'd-sm-none-table-cell' align='right'>{formatNumber(valueDiscount)}</td>
              <td className = 'd-md-none-table-cell' align='right'>{formatNumber(exent)}</td>
              <td className = 'd-md-none-table-cell' align='right'>{formatNumber(exonera)}</td>
              <td className = 'd-md-none-table-cell' align='right'>{formatNumber(gravado)}</td>
              <td align='right'>{formatNumber(valueTax)}</td>
              <td className = 'd-sm-none-table-cell' align='right'>{formatNumber(freight)}</td>
              <td className = 'd-sm-none-table-cell' align='right'>{formatNumber(otherCharges)}</td>
              <td align='right'>{formatNumber(valueTotal, "L.")}</td>
              <td className = 'd-sm-none-table-cell' align='right'>{formatNumber(bonification)}</td>
            </tr>
          </tbody>
        </Table>
      </Colxx>
    </Row>
  )
}

export default Totals