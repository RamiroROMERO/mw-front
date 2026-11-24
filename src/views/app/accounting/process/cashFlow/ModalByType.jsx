import { useIntl } from 'react-intl';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';
import { FIELD_LABELS } from './cashFlowRules';

// "Agrupado por Tipo" (cont_flujoefect_type1/type2.sc2): un solo modal para las dos formas del legacy. Las filas ya vienen agrupadas por tipo del back; `fields` (semanal o antigüedad) define las columnas.
const ModalByType = ({ data, setOpen }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { rows, fields } = data;

  const table = {
    columns: [
      { text: t('page.cashFlow.table.type'), dataField: 'typeName', headerStyle: { width: '20%' } },
      ...fields.map((f) => ({ text: t(FIELD_LABELS[f]), dataField: f, type: 'number' }))
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
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" /> {t('button.exit')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ModalByType;
