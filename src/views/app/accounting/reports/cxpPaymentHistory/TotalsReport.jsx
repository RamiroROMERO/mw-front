import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

const TotalsReport = ({ totalDocuments, totalPaid }) => {
  return (
    <Row>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField
          name="totalDocuments"
          label="page.cxpPaymentHistory.table.totalDocuments"
          value={totalDocuments}
          type="text"
          bold
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField
          name="totalPaid"
          label="page.cxpPaymentHistory.table.totalPaid"
          value={totalPaid}
          type="text"
          bold
          disabled
        />
      </Colxx>
    </Row>
  );
}

export default TotalsReport;
