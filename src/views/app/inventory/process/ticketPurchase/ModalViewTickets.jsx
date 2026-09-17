import { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages } from '@Helpers/Utils'
import ReactTable from '@Components/reactTable'

const ModalViewTickets = ({ data, setOpen }) => {
  const { dataTickets, fnViewTicket } = data;

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "dateIn",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("table.column.provider"),
        dataField: "provider",
        headerStyle: { width: "45%" }
      },
      {
        text: IntlMessages("table.column.numCai"),
        dataField: "numberCAI",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("button.count"),
        dataField: "accounted",
        headerStyle: { width: "20%" },
        style: { textAlign: 'center' }
      }
    ],
    data: dataTickets,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: (item) => { fnViewTicket(item); setOpen(false); }
      }
    ]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalViewTickets
