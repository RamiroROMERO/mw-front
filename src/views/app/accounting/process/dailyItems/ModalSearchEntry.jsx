import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, formatDate } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'

// "Abrir" (cont_pdaabrir.sc2): lista las partidas existentes, click en la fila la abre.
const ModalSearchEntry = ({ data, setOpen }) => {
  const { searchResults, fnSelectEntry } = data;

  const table = {
    title: IntlMessages("page.dailyItems.modal.search.title"),
    columns: [
      {
        text: IntlMessages("page.dailyItems.input.numberPDA"),
        dataField: "numberPDA",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("page.dailyItems.input.date"),
        dataField: "date",
        headerStyle: { width: "15%" },
        cell: ({ row }) => formatDate(row.original.date)
      },
      {
        text: IntlMessages("page.dailyItems.input.documentCode"),
        dataField: "documentCode",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("page.dailyItems.input.description"),
        dataField: "description",
        headerStyle: { width: "45%" }
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
