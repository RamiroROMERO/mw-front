import { Button, ModalBody, ModalFooter, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useIntl } from 'react-intl';
import { formatNumber, formatDate } from '@Helpers/Utils';
import { distributedTotal } from './purchaseAdvanceRules';

// Legacy inv_compras_dist_advance (SPEC v2-24-sr): la compra (factura, proveedor, valor, distribuido y saldo de su CxP), los anticipos
// del proveedor con saldo (el monto a asignar es editable) y las distribuciones ya hechas, cada una con "Deshacer".
const ModalDistAdvance = (props) => {
  // IntlMessages es un hook: un solo useIntl arriba, porque hay bloques condicionales (anticipos sin saldo, sin distribuciones).
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { data, setOpen } = props;
  const { preview, rows, providerName, fnChangeAmount, fnDistribute, fnAskUndo } = data;
  const purchase = preview?.purchase;
  const applied = preview?.applied || [];

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="12" md="3"><strong>{t('page.purchases.advance.invoice')}</strong><br />{purchase?.invoiceNumber}</Colxx>
          <Colxx xxs="12" md="3"><strong>{t('page.purchases.advance.provider')}</strong><br />{providerName}</Colxx>
          <Colxx xxs="4" md="2"><strong>{t('page.purchases.advance.total')}</strong><br />{formatNumber(purchase?.total ?? 0)}</Colxx>
          <Colxx xxs="4" md="2"><strong>{t('page.purchases.advance.distributed')}</strong><br />{formatNumber(distributedTotal(applied))}</Colxx>
          <Colxx xxs="4" md="2"><strong>{t('page.purchases.advance.balance')}</strong><br />{formatNumber(purchase?.cxpBalance ?? 0)}</Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <h6>{t('page.purchases.advance.available.title')}</h6>
            {rows.length === 0
              ? <p className="text-muted">{t('page.purchases.advance.noAvailable')}</p>
              : (
                <Table bordered hover size="sm" responsive>
                  <thead>
                    <tr>
                      <th>{t('page.purchases.advance.available.no')}</th>
                      <th>{t('page.purchases.advance.available.date')}</th>
                      <th>{t('page.purchases.advance.available.description')}</th>
                      <th align="right">{t('page.purchases.advance.available.balance')}</th>
                      <th align="right">{t('page.purchases.advance.available.assigned')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.advanceId}>
                        <th scope="row">{row.advanceId}</th>
                        <td>{formatDate(row.date)}</td>
                        <td>{row.description}</td>
                        <td align="right">{formatNumber(row.balance)}</td>
                        <td align="right">
                          <input className="form-control form-control-sm" type="number" step="0.01" min="0"
                            value={row.assigned} onChange={(e) => fnChangeAmount(row.advanceId, e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
          </Colxx>
        </Row>
        {applied.length > 0 && (
          <Row className="mt-3">
            <Colxx xxs="12">
              <h6>{t('page.purchases.advance.applied.title')}</h6>
              <Table bordered size="sm" responsive>
                <thead>
                  <tr>
                    <th>{t('page.purchases.advance.available.no')}</th>
                    <th>{t('page.purchases.advance.available.date')}</th>
                    <th>{t('page.purchases.advance.applied.pda')}</th>
                    <th align="right">{t('page.purchases.advance.applied.amount')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {applied.map((item) => (
                    <tr key={item.applyId}>
                      <th scope="row">{item.advanceId}</th>
                      <td>{formatDate(item.date)}</td>
                      <td>{item.pdaNumber}</td>
                      <td align="right">{formatNumber(item.amount)}</td>
                      <td align="center">
                        <Button color="danger" size="xs" outline onClick={() => fnAskUndo(item.applyId)}>
                          <i className="bi bi-arrow-counterclockwise" /> {t('page.purchases.advance.applied.undo')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Colxx>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" disabled={rows.length === 0} onClick={fnDistribute}>
          <i className="bi bi-check-lg" /> {t('button.accept')}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false); }}>
          <i className="bi bi-box-arrow-right" />
          {` ${t('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalDistAdvance;
