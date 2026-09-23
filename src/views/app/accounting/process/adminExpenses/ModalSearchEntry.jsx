import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'

// "Abrir" (cont_gastadminabrir.sc2): lista los documentos existentes, click en la fila lo abre.
const ModalSearchEntry = ({ data, setOpen }) => {
  const { searchResults, fnSelectEntry } = data;

  const table = {
    title: IntlMessages("page.adminExpenses.modal.search.title"),
    columns: [
      {
        text: IntlMessages("page.adminExpenses.input.date"),
        dataField: "date",
        headerStyle: { width: "20%" },
        cell: ({ row }) => formatDate(row.original.date)
      },
      {
        text: IntlMessages("page.adminExpenses.input.description"),
        dataField: "description",
        headerStyle: { width: "55%" }
      },
      {
        text: IntlMessages("page.adminExpenses.input.total"),
        dataField: "total",
        headerStyle: { width: "25%" },
        cell: ({ row }) => formatNumber(row.original.total)
      }
    ],
    data: searchResults,
    options: { columnActions: "options" },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnSelectEntry
      }
    ]
  };

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
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalSearchEntry
