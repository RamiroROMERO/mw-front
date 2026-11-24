import { useIntl } from 'react-intl';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import { formatNumber } from '@Helpers/Utils';
import { bucketLabels } from './cashFlowRules';

// Documentos de un proveedor o cliente a la fecha de corte, con la semana de la proyección y el rango de antigüedad de cada uno (los calcula el back).
// Un solo `useIntl`: `IntlMessages` es un hook y no puede llamarse una vez por fila.
const ModalDocuments = ({ data, setOpen }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { entityName, rows, total } = data;

  const table = {
    title: entityName,
    columns: [
      { text: t('page.cashFlow.table.document'), dataField: 'documentCode', headerStyle: { width: '18%' } },
      { text: t('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '10%' } },
      { text: t('page.cashFlow.table.dueDate'), dataField: 'dueDate', type: 'date', headerStyle: { width: '10%' } },
      { text: t('page.cashFlow.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '12%' } },
      { text: t('page.cashFlow.table.daysToDue'), dataField: 'daysToDue', type: 'number', headerStyle: { width: '8%' } },
      { text: t('page.cashFlow.table.projectionWeek'), dataField: 'weekText', headerStyle: { width: '14%' } },
      { text: t('page.cashFlow.table.agingRange'), dataField: 'agingText', headerStyle: { width: '14%' } },
      { text: t('table.column.description'), dataField: 'description', headerStyle: { width: '14%' } }
    ],
    data: rows.map((row) => {
      const labels = bucketLabels(row);
      return { ...row, weekText: labels.week ? t(labels.week) : '', agingText: labels.aging ? t(labels.aging) : '' };
    }),
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row className="mt-2">
          <Colxx xxs="12" className="text-end">
            <strong>{t('page.cashFlow.table.total')}: {formatNumber(total)}</strong>
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

export default ModalDocuments;
