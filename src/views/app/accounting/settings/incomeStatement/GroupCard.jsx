import { Button, Card, CardBody, CardTitle } from 'reactstrap';
import { IntlMessages } from '@Helpers/Utils';

// Una de las 7 grillas del legacy (Grid1..Grid7), cada una con su propio par de botones
// Agregar/Eliminar — colapsadas en un solo componente reutilizable parametrizado por Tipo.
const GroupCard = ({ label, hint, rows, onAdd, onRemove }) => {
  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h5">{IntlMessages(label)}</CardTitle>
        {hint && <p className="text-muted small mb-2">{IntlMessages(hint)}</p>}
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>{IntlMessages('page.incomeStatementStructure.table.account')}</th>
              <th>{IntlMessages('page.incomeStatementStructure.table.description')}</th>
              <th style={{ width: '10%' }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.accountNumber}>
                <td>{r.accountNumber}</td>
                <td>{r.accountName}</td>
                <td className="text-center">
                  <i
                    className="bi bi-trash-fill cursor-pointer"
                    title={IntlMessages('button.delete')}
                    onClick={() => onRemove(r.accountNumber)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button size="sm" color="secondary" onClick={onAdd}>
          <i className="bi bi-plus-lg" /> {IntlMessages('page.incomeStatementStructure.button.addAccounts')}
        </Button>
      </CardBody>
    </Card>
  );
}

export default GroupCard;
