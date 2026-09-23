import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

const TotalsReport = ({ total }) => {
  return (
    <Row>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField
          name="total"
          label="page.taxRetentionReport.totals.taxCredit"
          value={total}
          type="text"
          bold
          disabled
        />
      </Colxx>
    </Row>
  );
}

export default TotalsReport;
