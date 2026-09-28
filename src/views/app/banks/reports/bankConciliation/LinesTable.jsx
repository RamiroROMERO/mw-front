import { Table } from 'reactstrap';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';

// Tabla cruda (no ReactTable/ReactTableEdit) porque cada fila necesita dos checkboxes
// editables independientes (concilia banco/concilia libro) — ver feedback_reacttableedit_no_actions_no_cell.
export const LinesTable = ({ lines, fnToggleConBank, fnToggleConBook }) => {
  return (
    <Table bordered hover responsive size="sm">
      <thead>
        <tr>
          <th>{IntlMessages('table.column.date')}</th>
          <th>{IntlMessages('input.document')}</th>
          <th>{IntlMessages('page.variousDeposits.input.documentNumber')}</th>
          <th>{IntlMessages('table.column.beneficiary')}</th>
          <th>{IntlMessages('page.variousDeposits.input.description')}</th>
          <th>{IntlMessages('table.column.reference')}</th>
          <th align="right">{IntlMessages('page.checks.input.valueDebe')}</th>
          <th align="right">{IntlMessages('page.checks.input.valueHaber')}</th>
          <th align="center">{IntlMessages('page.bankConciliation.table.conBank')}</th>
          <th align="center">{IntlMessages('page.bankConciliation.table.conBook')}</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <tr key={line.id} style={line.annulled ? { textDecoration: 'line-through', color: '#adb5bd' } : undefined}>
            <td>{DateHelper.format(line.date)}</td>
            <td>{line.documentCode}</td>
            <td>{line.documentId}</td>
            <td>{line.benefName}</td>
            <td>{line.description}</td>
            <td>{line.reference}</td>
            <td align="right">{formatNumber(line.valueDebit)}</td>
            <td align="right">{formatNumber(line.valueCredit)}</td>
            <td align="center">
              <input type="checkbox" checked={!!line.isConBank} onChange={() => fnToggleConBank(line.id)} />
            </td>
            <td align="center">
              <input type="checkbox" checked={!!line.isConBook} onChange={() => fnToggleConBook(line.id)} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
