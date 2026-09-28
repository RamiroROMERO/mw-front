import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

const HeaderForm = ({ header, onInputChangeHeader }) => {
  const { periodName, bankName, date, dateIn, dateOut, valueBank, valueBook } = header;
  const periodRange = dateIn && dateOut ? `${dateIn}  ->  ${dateOut}` : '';

  return (
    <Row>
      <Colxx xxs="12" md="6" lg="3">
        <InputField name="periodName" label="page.bankConciliation.input.periodName" value={periodName} type="text" disabled />
      </Colxx>
      <Colxx xxs="12" md="6" lg="3">
        <InputField name="bankName" label="select.bankCode" value={bankName} type="text" disabled />
      </Colxx>
      <Colxx xxs="12" md="6" lg="3">
        <InputField name="periodRange" label="page.bankConciliation.input.periodRange" value={periodRange} type="text" disabled />
      </Colxx>
      <Colxx xxs="12" md="6" lg="3">
        <InputField name="date" label="table.column.date" value={date} type="text" disabled />
      </Colxx>
      <Colxx xxs="12" md="6" lg="3">
        <InputField
          name="valueBank"
          label="page.bankConciliation.input.valueBank"
          value={valueBank}
          onChange={onInputChangeHeader}
          type="text"
        />
      </Colxx>
      <Colxx xxs="12" md="6" lg="3">
        <InputField
          name="valueBook"
          label="page.bankConciliation.input.valueBook"
          value={valueBook}
          onChange={onInputChangeHeader}
          type="text"
        />
      </Colxx>
    </Row>
  );
}

export default HeaderForm;
