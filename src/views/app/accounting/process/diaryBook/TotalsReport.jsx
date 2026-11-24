import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';

// Totales de TODO el conjunto filtrado (los calcula el back en centavos), no solo de la página que se ve.
const TotalsReport = ({ count, debit, credit, diff, unbalanced, unbalancedLabel }) => {
  return (
    <Row>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField name="count" label="page.diaryBook.table.count" value={count} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField name="debit" label="page.diaryBook.table.debit" value={debit} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField name="credit" label="page.diaryBook.table.credit" value={credit} type="text" bold disabled />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="3">
        <InputField name="diff" label="page.diaryBook.table.diff" value={diff} type="text" bold disabled />
        {unbalanced && <small className="text-danger" data-testid="unbalanced">{unbalancedLabel}</small>}
      </Colxx>
    </Row>
  );
};

export default TotalsReport;
