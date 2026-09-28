import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

const TotalsReport = ({
  openingBalance, openingBalanceUsd, valueDebit, valueCredit, valueDebitUsd, valueCreditUsd,
  closingBalance, closingBalanceUsd
}) => {
  return (
    <>
      <Row className="mb-2">
        <Colxx xxs="12" xs="6" sm="3">
          <InputField name="openingBalance" label="page.banksBook.table.openingBalance" value={openingBalance} type="text" bold disabled />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="3">
          <InputField name="openingBalanceUsd" label="page.banksBook.table.openingBalanceUsd" value={openingBalanceUsd} type="text" bold disabled />
        </Colxx>
      </Row>
      <Row className="mb-2">
        <Colxx xxs="12" xs="6" sm="3">
          <InputField name="valueDebit" label="page.checks.input.valueDebe" value={valueDebit} type="text" bold disabled />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="3">
          <InputField name="valueCredit" label="page.checks.input.valueHaber" value={valueCredit} type="text" bold disabled />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="3">
          <InputField name="valueDebitUsd" label="page.banksBook.table.debitUsd" value={valueDebitUsd} type="text" bold disabled />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="3">
          <InputField name="valueCreditUsd" label="page.banksBook.table.creditUsd" value={valueCreditUsd} type="text" bold disabled />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" xs="6" sm="3">
          <InputField name="closingBalance" label="page.banksBook.table.closingBalance" value={closingBalance} type="text" bold disabled />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="3">
          <InputField name="closingBalanceUsd" label="page.banksBook.table.closingBalanceUsd" value={closingBalanceUsd} type="text" bold disabled />
        </Colxx>
      </Row>
    </>
  );
}

export default TotalsReport;
