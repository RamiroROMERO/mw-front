import { Alert, Badge } from 'reactstrap';
import { useIntl } from 'react-intl';
import { lockReasonIds, paymentStatusId } from './otherPurchaseRules';

// Avisos de la pantalla (SPEC v2-30-sr). Un solo useIntl arriba: IntlMessages es un hook y no se puede llamar en una condición.
const OtherPurchaseNotices = ({ editLock, pendingAccounting, paymentStatus }) => {
  const intl = useIntl();
  const reasons = lockReasonIds(editLock?.reasons).map((id) => intl.formatMessage({ id }));
  const lockedText = reasons.length > 0
    ? intl.formatMessage({ id: 'page.otherPurchases.locked.notice' }, { reasons: intl.formatList(reasons, { type: 'conjunction' }) })
    : intl.formatMessage({ id: 'page.otherPurchases.locked.noticeNoReasons' });
  const statusId = paymentStatusId(paymentStatus);

  return (
    <>
      {statusId && (
        <div className="mb-2" data-testid="other-purchase-payment-status">
          <Badge color={paymentStatus === 'paid' ? 'success' : 'warning'}>{intl.formatMessage({ id: statusId })}</Badge>
        </div>
      )}
      {editLock?.financial && (
        <Alert color="warning" className="mb-2" data-testid="other-purchase-locked-notice">
          <i className="bi bi-lock me-2" />
          {lockedText}
        </Alert>
      )}
      {pendingAccounting && (
        <Alert color="info" className="mb-2" data-testid="other-purchase-pending-notice">
          <i className="bi bi-journal-text me-2" />
          {intl.formatMessage({ id: 'page.otherPurchases.pending.notice' })}
        </Alert>
      )}
    </>
  );
};

export default OtherPurchaseNotices;
