import { useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, formatNumber } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'

const ModalSeekOriginPurchase = ({ setOpen, data }) => {
  const { dataPurchases, fnSelect } = data;

  const [table] = useState({
    title: '',
    columns: [
      { text: IntlMessages("table.column.dateIn"), dataField: "date", headerStyle: { width: "15%" } },
      { text: IntlMessages("table.column.invoice"), dataField: "numCai", headerStyle: { width: "45%" } },
      {
        text: IntlMessages("table.column.value"), dataField: "total", headerStyle: { width: "20%" }, style: { textAlign: 'right' },
        cell: ({ row }) => formatNumber(row.original.total)
      }
    ],
    data: dataPurchases,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnSelect
      }
    ]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} data={dataPurchases} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalSeekOriginPurchase
