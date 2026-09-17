import { useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, formatNumber } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'

const TYPE_LABELS = {
  1: 'page.creditNotesProv.radio.discount',
  2: 'page.creditNotesProv.radio.cancellation',
  3: 'page.creditNotesProv.radio.devolution',
  4: 'page.creditNotesProv.radio.others'
};

const ModalSeekCreditNotesProv = ({ setOpen, data }) => {
  const { dataCreditNotes, fnView } = data;

  const rows = dataCreditNotes.map((item) => ({
    ...item,
    providerName: item.providerData ? item.providerData.name : '',
    typeName: IntlMessages(TYPE_LABELS[item.typeId] || '')
  }));

  const [table] = useState({
    title: '',
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { width: "12%" } },
      { text: IntlMessages("page.creditNotesProv.input.internalNumber"), dataField: "documentId", headerStyle: { width: "10%" } },
      { text: IntlMessages("page.creditNotesProv.input.numberCAI"), dataField: "numberCAI", headerStyle: { width: "18%" } },
      { text: IntlMessages("table.column.provider"), dataField: "providerName", headerStyle: { width: "25%" } },
      { text: IntlMessages("page.creditNotesProv.title.type"), dataField: "typeName", headerStyle: { width: "10%" } },
      {
        text: IntlMessages("table.column.value"), dataField: "valueLps", headerStyle: { width: "15%" }, style: { textAlign: 'right' },
        cell: ({ row }) => formatNumber(row.original.valueLps)
      }
    ],
    data: rows,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnView
      }
    ]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} data={rows} />
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

export default ModalSeekCreditNotesProv
