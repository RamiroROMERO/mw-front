import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { FIELD_LABELS } from './useCashFlow';

const buildTotalsTable = (fields, rowsDef) => {
  const columns = [
    { text: '', dataField: 'label', headerStyle: { width: '15%' } },
    ...fields.map((f) => ({ text: IntlMessages(FIELD_LABELS[f]), dataField: f, type: 'number' }))
  ];
  const data = rowsDef.map(([label, totals]) => {
    const row = { label: IntlMessages(label) };
    fields.forEach((f) => { row[f] = totals ? totals[f] : 0; });
    return row;
  });
  return { columns, data };
}

// "Resumen" — legacy Page_hw1 de cont_flujoefect.sc2: saldo en bancos + comparativo
// CxC/CxP/Diferencia por semana y por antigüedad de saldos.
const ResumenTab = ({ summary, weekFields, agingFields }) => {
  if (!summary) return null;

  const bankColumns = [
    { text: IntlMessages('table.column.code'), dataField: 'code', headerStyle: { width: '20%' } },
    { text: IntlMessages('page.cashFlow.table.bank'), dataField: 'name', headerStyle: { width: '55%' } },
    { text: IntlMessages('page.cashFlow.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '25%' } }
  ];

  const weekTable = buildTotalsTable(weekFields, [
    ['page.cashFlow.table.cxc', summary.cxcWeekTotals],
    ['page.cashFlow.table.cxp', summary.cxpWeekTotals],
    ['page.cashFlow.table.difference', summary.weekDiff]
  ]);
  const agingTable = buildTotalsTable(agingFields, [
    ['page.cashFlow.table.cxc', summary.cxcAgingTotals],
    ['page.cashFlow.table.cxp', summary.cxpAgingTotals],
    ['page.cashFlow.table.difference', summary.agingDiff]
  ]);

  return (
    <>
      <Row className="mb-3">
        <Colxx xxs="12" md="6">
          <Card>
            <CardBody>
              <h5>{IntlMessages('page.cashFlow.title.banks')}</h5>
              <ReactTable columns={bankColumns} data={summary.banks} options={{ pageSize: 10 }} />
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" md="6">
          <Card>
            <CardBody className="d-flex flex-column justify-content-center align-items-center h-100">
              <h5>{IntlMessages('page.cashFlow.title.bankTotal')}</h5>
              <h2>{formatNumber(summary.bankTotal)}</h2>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row className="mb-3">
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <h5>{IntlMessages('page.cashFlow.title.weekSummary')}</h5>
              <ReactTable {...weekTable} options={{ pageSize: 5 }} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <h5>{IntlMessages('page.cashFlow.title.agingSummary')}</h5>
              <ReactTable {...agingTable} options={{ pageSize: 5 }} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  );
}

export default ResumenTab;
