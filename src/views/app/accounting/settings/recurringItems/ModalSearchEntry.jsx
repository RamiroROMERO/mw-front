import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, formatNumber } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'

// "Abrir" (cont_pdas_pre.sc2): lista las plantillas existentes, click en la fila la abre.
const ModalSearchEntry = ({ data, setOpen }) => {
  const { searchResults, fnSelectEntry } = data;

  const table = {
    title: IntlMessages("page.recurringItems.modal.search.title"),
    columns: [
      {
        text: IntlMessages("page.recurringItems.input.name"),
        dataField: "name",
        headerStyle: { width: "45%" }
      },
      {
        text: IntlMessages("page.recurringItems.input.dayRun"),
        dataField: "dayRun",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("page.recurringItems.input.total"),
        dataField: "valueTotal",
        headerStyle: { width: "20%" },
        cell: ({ row }) => formatNumber(row.original.valueTotal)
      },
      {
        text: IntlMessages("page.recurringItems.input.status"),
        dataField: "status",
        headerStyle: { width: "15%" },
        cell: ({ row }) => IntlMessages(row.original.status ? 'label.title.active' : 'label.title.inactive')
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
