import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

const TotalsReport = ({ total, exemptValue, exoneratedValue, taxedValue, tax }) => {
  return (
    <Row>
      <Colxx xxs="12" xs="6" sm="4" lg="2">
        <InputField
          name="total"
          label="table.column.total"
          value={total}
          type="text"
          bold
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="2">
        <InputField
          name="exemptValue"
          label="page.taxPurchaseReport.table.exemptValue"
          value={exemptValue}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="2">
        <InputField
          name="exoneratedValue"
          label="page.taxSalesReport.table.exoneratedValue"
          value={exoneratedValue}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="2">
        <InputField
          name="taxedValue"
          label="page.taxPurchaseReport.table.taxedValue"
          value={taxedValue}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="2">
        <InputField
          name="tax"
          label="page.taxSalesReport.totals.taxDebit"
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
