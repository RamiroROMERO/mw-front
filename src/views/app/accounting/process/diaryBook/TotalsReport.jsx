import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

const TotalsReport = ({ debit, credit }) => {
  return (
    <Row>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField
          name="debit"
          label="page.diaryBook.table.debit"
          value={debit}
          type="text"
          bold
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField
          name="credit"
          label="page.diaryBook.table.credit"
          value={credit}
          type="text"
          bold
          disabled
        />
      </Colxx>
    </Row>
  );
}

export default TotalsReport;
