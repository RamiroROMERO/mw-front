import { Alert } from 'reactstrap';
import { useIntl } from 'react-intl';
import { reasonMessageIds } from './purchaseProcessingRules';

// SPEC v2-29-sr: aviso de una compra ya procesada. Un solo useIntl arriba (IntlMessages es un hook y no se puede llamar en una condición).
const ProcessedNotice = ({ reasons }) => {
  const intl = useIntl();
  const motives = reasonMessageIds(reasons).map((id) => intl.formatMessage({ id }));
  const text = motives.length > 0
    ? intl.formatMessage({ id: 'page.purchases.processed.notice' }, { reasons: intl.formatList(motives, { type: 'conjunction' }) })
    : intl.formatMessage({ id: 'page.purchases.processed.noticeNoReasons' });
  return (
    <Alert color="warning" className="mt-3 mb-0" data-testid="purchase-processed-notice">
      <i className="bi bi-lock me-2" />
      {text}
    </Alert>
  );
};

export default ProcessedNotice;
