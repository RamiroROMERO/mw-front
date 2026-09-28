import { Table, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

const CATEGORY_KEYS = [
  ['checks', 'page.bankConciliation.totals.checks'],
  ['deposits', 'page.bankConciliation.totals.deposits'],
  ['creditNotes', 'page.bankConciliation.totals.creditNotes'],
  ['debitNotes', 'page.bankConciliation.totals.debitNotes'],
  ['transfers', 'page.bankConciliation.totals.transfers']
];

const TotalsPanel = ({ propsToTotals }) => {
  return (
    <>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th />
            <th align="right">{IntlMessages('page.bankConciliation.totals.book')}</th>
            <th align="right">{IntlMessages('page.bankConciliation.totals.bank')}</th>
            <th align="right">{IntlMessages('page.bankConciliation.totals.difference')}</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORY_KEYS.map(([key, labelKey]) => (
            <tr key={key}>
              <td>{IntlMessages(labelKey)}</td>
              <td align="right">{propsToTotals[key].book}</td>
              <td align="right">{propsToTotals[key].bank}</td>
              <td align="right">{propsToTotals[key].diff}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Row>
        <Colxx xxs="12" sm="4">
          <InputField name="adjBook" label="page.bankConciliation.totals.adjBook" value={propsToTotals.adjBook} type="text" bold disabled />
        </Colxx>
        <Colxx xxs="12" sm="4">
          <InputField name="adjBank" label="page.bankConciliation.totals.adjBank" value={propsToTotals.adjBank} type="text" bold disabled />
        </Colxx>
        <Colxx xxs="12" sm="4">
          <InputField name="finalDifference" label="page.bankConciliation.totals.finalDifference" value={propsToTotals.finalDifference} type="text" bold disabled />
        </Colxx>
      </Row>
    </>
  );
}

export default TotalsPanel;
