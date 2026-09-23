import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, formatNumber } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'

// "Asientos Pre." (Controlpanelbtn4 de cont_pdas.sc2, equivalente a cont_pdas_pre_open.sc2):
// elige una Partida Recurrente activa para cargar sus líneas en el documento nuevo actual.
const ModalRecurringSelect = ({ data, setOpen }) => {
  const { pending, fnSelectRecurring } = data;

  const table = {
    title: IntlMessages("page.dailyItems.modal.recurringSelect.title"),
    columns: [
      {
        text: IntlMessages("page.recurringItems.input.name"),
        dataField: "name",
        headerStyle: { width: "55%" }
      },
      {
        text: IntlMessages("page.recurringItems.input.dayRun"),
        dataField: "dayRun",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("page.recurringItems.input.total"),
        dataField: "valueTotal",
        headerStyle: { width: "25%" },
        cell: ({ row }) => formatNumber(row.original.valueTotal)
      }
    ],
    data: pending,
    options: { columnActions: "options" },
    actions: [
      {
        color: "primary",
        icon: "check-lg",
        toolTip: IntlMessages("button.view"),
        onClick: fnSelectRecurring
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

export default ModalRecurringSelect
