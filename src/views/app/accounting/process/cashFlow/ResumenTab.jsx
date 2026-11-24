import { useIntl } from 'react-intl';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import { formatNumber } from '@Helpers/Utils';
import { WEEK_FIELDS, AGING_FIELDS, FIELD_LABELS, weekSummaryRows, agingSummaryRows, banksWithoutAccount } from './cashFlowRules';

// "Resumen" (Page_hw1 de cont_flujoefect.sc2): saldo en bancos, comparativo CxC / CxP / diferencia por semana y por antigüedad, y el saldo proyectado semana a semana (bancos + diferencia acumulada). Todo
// viene calculado del back. Un solo `useIntl` (IntlMessages es un hook).
const ResumenTab = ({ summary }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  if (!summary) return null;

  const totalsTable = (fields, rows) => ({
    columns: [
      { text: '', dataField: 'label', headerStyle: { width: '16%' } },
      ...fields.map((f) => ({ text: t(FIELD_LABELS[f]), dataField: f, type: 'number' }))
    ],
    data: rows.map((r) => ({ label: t(r.label), ...Object.fromEntries(fields.map((f) => [f, r.totals[f]])) })),
    options: { pageSize: 5 }
  });

  const bankColumns = [
    { text: t('table.column.code'), dataField: 'code', headerStyle: { width: '15%' } },
    { text: t('page.cashFlow.table.bank'), dataField: 'name', headerStyle: { width: '40%' } },
    { text: t('page.cashFlow.table.accountNumber'), dataField: 'accountNumber', headerStyle: { width: '20%' } },
    { text: t('page.cashFlow.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '25%' } }
  ];
  const missing = banksWithoutAccount(summary.banks);

  return (
    <>
      <Row className="mb-3">
        <Colxx xxs="12" md="7">
          <Card>
            <CardBody>
              <h5>{t('page.cashFlow.title.banks')}</h5>
              <ReactTable columns={bankColumns} data={summary.banks} options={{ pageSize: 10 }} />
              {missing > 0 && <small className="text-danger" data-testid="missing-account">{t('page.cashFlow.msg.missingBankAccount')}</small>}
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" md="5">
          <Card>
            <CardBody className="d-flex flex-column justify-content-center align-items-center h-100">
              <h5>{t('page.cashFlow.title.bankTotal')}</h5>
              <h2>{formatNumber(summary.bankTotal)}</h2>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row className="mb-3">
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <h5>{t('page.cashFlow.title.weekSummary')}</h5>
              <ReactTable {...totalsTable(WEEK_FIELDS, weekSummaryRows(summary))} />
              <small className="text-muted">{t('page.cashFlow.msg.projectionNote')}</small>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <h5>{t('page.cashFlow.title.agingSummary')}</h5>
              <ReactTable {...totalsTable(AGING_FIELDS, agingSummaryRows(summary))} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  );
};

export default ResumenTab;
