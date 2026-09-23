import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'

// "Conceptos" (btnGenAuxiliar.Click de cont_pdas.sc2, equivalente a cont_constrans_seek.sc2):
// elige un Concepto y Transacción configurado para el Tipo de Documento actual — autocompleta
// la cuenta de la línea nueva.
const ModalConceptsSelect = ({ data, setOpen }) => {
  const { pending, fnSelectConcept } = data;

  const table = {
    title: IntlMessages("page.dailyItems.modal.concepts.title"),
    columns: [
      {
        text: IntlMessages("page.dailyItems.input.conceptName"),
        dataField: "name",
        headerStyle: { width: "50%" }
      },
      {
        text: IntlMessages("page.dailyItems.input.account"),
        dataField: "accountNumber",
        headerStyle: { width: "50%" },
        cell: ({ row }) => `${row.original.accountNumber} - ${row.original.accountName}`
      }
    ],
    data: pending,
    options: { columnActions: "options" },
    actions: [
      {
        color: "primary",
        icon: "check-lg",
        toolTip: IntlMessages("button.view"),
        onClick: fnSelectConcept
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

export default ModalConceptsSelect
