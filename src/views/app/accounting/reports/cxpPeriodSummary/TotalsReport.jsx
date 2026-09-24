import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

const TotalsReport = ({ totalAccumulated, totalAdded, totalTotal, totalPaid, totalBalance }) => {
  return (
    <Row>
      <Colxx xxs="12" xs="6" sm="2">
        <InputField name="totalAccumulated" label="page.cxpPeriodSummary.table.accumulated" value={totalAccumulated} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="2">
        <InputField name="totalAdded" label="page.cxpPeriodSummary.table.added" value={totalAdded} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="2">
        <InputField name="totalTotal" label="page.cxpPeriodSummary.table.total" value={totalTotal} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="2">
        <InputField name="totalPaid" label="page.cxpPeriodSummary.table.paid" value={totalPaid} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="2">
        <InputField name="totalBalance" label="page.cxpPeriodSummary.table.balance" value={totalBalance} type="text" bold disabled />
      </Colxx>
    </Row>
  );
}

export default TotalsReport;
