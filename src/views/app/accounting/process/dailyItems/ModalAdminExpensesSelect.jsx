import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'

// "Gastos Admin." (Controlpanelbtn de cont_pdas.sc2, equivalente a cont_gastadminabrir.sc2):
// elige un documento de Gastos Administrativos para agregar sus líneas como Débitos nuevos.
const ModalAdminExpensesSelect = ({ data, setOpen }) => {
  const { pending, fnSelectAdminExpense } = data;

  const table = {
    title: IntlMessages("page.dailyItems.modal.adminExpensesSelect.title"),
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
    data: pending,
    options: { columnActions: "options" },
    actions: [
      {
        color: "primary",
        icon: "check-lg",
        toolTip: IntlMessages("button.view"),
        onClick: fnSelectAdminExpense
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

export default ModalAdminExpensesSelect
