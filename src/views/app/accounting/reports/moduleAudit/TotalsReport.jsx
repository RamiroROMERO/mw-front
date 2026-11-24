import { Button, ButtonGroup, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

// Totales de TODO el conjunto filtrado (los calcula el back en centavos) y el filtro "Todos / Con problemas" con su cantidad.
const TotalsReport = ({ count, value, accountingValue, difference, statusFilter, setStatusFilter, allLabel, issuesLabel }) => {
  return (
    <>
      <Row className="mb-2">
        <Colxx xxs="12">
          <ButtonGroup>
            <Button color="primary" outline active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>{allLabel}</Button>
            <Button color="primary" outline active={statusFilter === 'issues'} onClick={() => setStatusFilter('issues')}>{issuesLabel}</Button>
          </ButtonGroup>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="6" md="3">
          <InputField name="count" label="page.moduleAudit.summary.documents" value={count} type="text" disabled />
        </Colxx>
        <Colxx xxs="6" md="3">
          <InputField name="value" label="page.moduleAudit.table.value" value={value} type="text" bold disabled />
        </Colxx>
        <Colxx xxs="6" md="3">
          <InputField name="accountingValue" label="page.moduleAudit.table.accountingValue" value={accountingValue} type="text" bold disabled />
        </Colxx>
        <Colxx xxs="6" md="3">
          <InputField name="difference" label="page.moduleAudit.table.difference" value={difference} type="text" bold disabled />
        </Colxx>
      </Row>
    </>
  );
};

export default TotalsReport;
