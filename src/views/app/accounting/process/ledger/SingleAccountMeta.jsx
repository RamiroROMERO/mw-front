import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

// Totales de TODO el rango consultado (los calcula el back en centavos), no solo de la página que se ve. En "Varias Cuentas" solo hay cantidad, Debe y Haber.
const SingleAccountMeta = ({ single, accountName, unknownType, count, openingBalance, totalDebit, totalCredit, closingBalance }) => {
  return (
    <>
      <Row>
        {single && (
          <Colxx xxs="12" sm="4">
            <InputField name="accountName" label="page.ledger.input.accountCode" value={accountName} type="text" bold disabled />
          </Colxx>
        )}
        <Colxx xxs="6" sm="2">
          <InputField name="count" label="page.diaryBook.table.count" value={count} type="text" disabled />
        </Colxx>
        {single && (
          <Colxx xxs="6" sm="2">
            <InputField name="openingBalance" label="page.ledger.totals.openingBalance" value={openingBalance} type="text" disabled />
          </Colxx>
        )}
        <Colxx xxs="6" sm="2">
          <InputField name="totalDebit" label="page.diaryBook.table.debit" value={totalDebit} type="text" disabled />
        </Colxx>
        <Colxx xxs="6" sm="2">
          <InputField name="totalCredit" label="page.diaryBook.table.credit" value={totalCredit} type="text" disabled />
        </Colxx>
        {single && (
          <Colxx xxs="6" sm="2">
            <InputField name="closingBalance" label="page.ledger.totals.closingBalance" value={closingBalance} type="text" bold disabled />
          </Colxx>
        )}
      </Row>
      {single && unknownType && (
        <small className="text-danger" data-testid="unknown-type">{IntlMessages('page.ledger.msg.unknownType')}</small>
      )}
    </>
  );
};

export default SingleAccountMeta;
