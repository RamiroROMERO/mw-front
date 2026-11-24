import { Button, Card, CardBody, CardTitle } from 'reactstrap';
import { useIntl } from 'react-intl';

// Una de las 7 grillas del legacy (Grid1..Grid7), cada una con su propio par de botones Agregar/Eliminar, en un solo componente parametrizado por grupo.
// IntlMessages es un hook: se usa un solo `useIntl` arriba y `t()` en el resto (nunca dentro de un .map ni de una condición).
const GroupCard = ({ label, hint, rows, onAdd, onRemove }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h5">{t(label)}</CardTitle>
        {hint && <p className="text-muted small mb-2">{t(hint)}</p>}
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>{t('page.incomeStatementStructure.table.account')}</th>
              <th>{t('page.incomeStatementStructure.table.description')}</th>
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
                    title={t('button.delete')}
                    onClick={() => onRemove(r.accountNumber)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button size="sm" color="secondary" onClick={onAdd}>
          <i className="bi bi-plus-lg" /> {t('page.incomeStatementStructure.button.addAccounts')}
        </Button>
      </CardBody>
    </Card>
  );
};

export default GroupCard;
