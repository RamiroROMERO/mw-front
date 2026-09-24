import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

const TotalsReport = ({ totalValue, totalCreditNote, totalDebitNote, totalBalance }) => {
  return (
    <Row>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField name="totalValue" label="page.cxpProviderHistory.table.originalValue" value={totalValue} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField name="totalCreditNote" label="page.cxpProviderHistory.table.creditNoteValue" value={totalCreditNote} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField name="totalDebitNote" label="page.cxpProviderHistory.table.debitNoteValue" value={totalDebitNote} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField name="totalBalance" label="page.cxpProviderHistory.table.balance" value={totalBalance} type="text" bold disabled />
      </Colxx>
    </Row>
  );
}

export default TotalsReport;
