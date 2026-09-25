import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

const TotalsReport = ({ totalValue, totalAccountingValue, totalDifference }) => {
  return (
    <Row>
      <Colxx xxs="12" xs="4">
        <InputField name="totalValue" label="page.moduleAudit.table.value" value={totalValue} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="4">
        <InputField name="totalAccountingValue" label="page.moduleAudit.table.accountingValue" value={totalAccountingValue} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="4">
        <InputField name="totalDifference" label="page.moduleAudit.table.difference" value={totalDifference} type="text" bold disabled />
      </Colxx>
    </Row>
  );
}

export default TotalsReport;
