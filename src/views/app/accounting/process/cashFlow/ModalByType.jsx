import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';
import { FIELD_LABELS } from './useCashFlow';

// "Agrupado por Tipo" — legacy cont_flujoefect_type1.sc2/type2.sc2. En vez de las 2 formas
// separadas del legacy, un solo modal reutilizable: recibe filas ya agrupadas por tipo desde
// useCashFlow.fnOpenByType (agrupación hecha en el cliente sobre los datos ya cargados, sin
// ida y vuelta al backend) y sus `fields` (semanal o antigüedad) determinan las columnas.
const ModalByType = ({ data, setOpen }) => {
  const { rows, fields } = data;

  const table = {
    columns: [
      { text: IntlMessages("page.cashFlow.table.type"), dataField: "typeName", headerStyle: { width: "20%" } },
      ...fields.map((f) => ({ text: IntlMessages(FIELD_LABELS[f]), dataField: f, type: 'number' }))
    ],
    data: rows,
    options: { pageSize: 10 }
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

export default ModalByType
