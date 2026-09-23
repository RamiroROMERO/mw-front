import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

const SingleAccountMeta = ({ accountName, openingBalance, totalDebit, totalCredit, closingBalance }) => {
  return (
    <Row>
      <Colxx xxs="12" sm="4">
        <InputField
          name="accountName"
          label="page.ledger.input.accountCode"
          value={accountName}
          type="text"
          bold
          disabled
        />
      </Colxx>
      <Colxx xxs="6" sm="2">
        <InputField
          name="openingBalance"
          label="page.ledger.totals.openingBalance"
          value={openingBalance}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="6" sm="2">
        <InputField
          name="totalDebit"
          label="page.diaryBook.table.debit"
          value={totalDebit}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="6" sm="2">
        <InputField
          name="totalCredit"
          label="page.diaryBook.table.credit"
          value={totalCredit}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="6" sm="2">
        <InputField
          name="closingBalance"
          label="page.ledger.totals.closingBalance"
          value={closingBalance}
          type="text"
          bold
          disabled
        />
      </Colxx>
    </Row>
  );
}

export default SingleAccountMeta;
