import { Alert } from 'reactstrap';
import { useIntl } from 'react-intl';

// Aviso de una orden de combustible ya contabilizada (SPEC v2-33-sr): solo se pueden editar las observaciones. Un solo useIntl
// arriba: IntlMessages es un hook y no se puede llamar en una condición.
const ProcessedNotice = ({ processed, pdaNumber }) => {
  const intl = useIntl();
  if (!processed) return null;
  return (
    <Alert color="warning" className="mb-3" data-testid="fuel-purchase-processed-notice">
      <i className="bi bi-lock me-2" />
      {intl.formatMessage({ id: 'page.fuelPurchases.processed.notice' }, { pda: pdaNumber })}
    </Alert>
  );
};

export default ProcessedNotice;
