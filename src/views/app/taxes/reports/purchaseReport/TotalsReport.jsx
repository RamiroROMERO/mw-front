import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

const TotalsReport = ({ total, exemptValue, taxedValue, tax }) => {
  return (
    <Row>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField
          name="total"
          label="table.column.total"
          value={total}
          type="text"
          bold
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField
          name="exemptValue"
          label="page.taxPurchaseReport.table.exemptValue"
          value={exemptValue}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField
          name="taxedValue"
          label="page.taxPurchaseReport.table.taxedValue"
          value={taxedValue}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField
          name="tax"
          label="page.taxPurchaseReport.totals.taxCredit"
          value={tax}
          type="text"
          bold
          disabled
        />
      </Colxx>
    </Row>
  );
}

export default TotalsReport;
