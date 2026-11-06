import { Badge, Card, CardBody, Row, Table } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import { formatNumber, formatDate } from '@Helpers/Utils';
import ModalViewPurchases from '../purchases/ModalViewPurchases';
import { rowStatus } from './receiptRules';
import { usePurchaseReceipts } from './usePurchaseReceipts';

const ROW_CLASS = { zero: 'table-danger', differs: 'table-warning', invalid: 'table-danger', ok: '' };

// Legacy inv_compras_valid (SPEC v2-26-sr): la compra elegida y sus movimientos de kardex con lo comprado, lo recibido (editable) y el
// vencimiento (editable). Rojo si la recibida es 0, amarillo si difiere de lo comprado.
const PurchaseReceipts = (props) => {
  const { setLoading } = props;
  // IntlMessages es un hook: un solo useIntl arriba, porque hay bloques condicionales.
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });

  const {
    purchase, preview, rows, problems, dataPurchases, openModalPurchases, setOpenModalPurchases, openMsgSave, setOpenMsgSave,
    fnNew, fnSearch, fnSave, fnOkSave, fnSelectPurchase, fnLoadDetail, fnChangeRow
  } = usePurchaseReceipts({ setLoading });

  const invalid = (kardexId, field) => problems.some((problem) => problem.kardexId === kardexId && problem.field === field);

  const propsToControlPanel = { fnNew, fnSearch, fnSave };

  const propsToModalPurchases = {
    ModalContent: ModalViewPurchases,
    title: 'page.purchases.modal.viewPurchases.title',
    open: openModalPurchases,
    setOpen: setOpenModalPurchases,
    maxWidth: 'lg',
    data: { dataPurchases, setBulkForm: fnSelectPurchase, fnGetDataDetail: fnLoadDetail }
  };

  const propsToMsgSave = {
    open: openMsgSave,
    setOpen: setOpenMsgSave,
    fnOnOk: fnOkSave,
    title: 'page.purchaseReceipts.msg.confirmSave'
  };

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              {!preview && <p className="text-muted">{t('page.purchaseReceipts.hint')}</p>}
              {preview && (
                <>
                  <Row className="mb-3">
                    <Colxx xxs="6" md="2"><strong>{t('page.purchaseReceipts.document')}</strong><br />{preview.documentId}</Colxx>
                    <Colxx xxs="6" md="3"><strong>{t('page.purchaseReceipts.invoice')}</strong><br />{preview.invoiceNumber}</Colxx>
                    <Colxx xxs="6" md="2"><strong>{t('page.purchaseReceipts.date')}</strong><br />{formatDate(preview.date)}</Colxx>
                    <Colxx xxs="6" md="3"><strong>{t('page.purchaseReceipts.provider')}</strong><br />{purchase?.provider}</Colxx>
                    <Colxx xxs="12" md="2">
                      {preview.validated && <Badge color="info" className="me-1">{t('page.purchaseReceipts.status.validated')}</Badge>}
                      {preview.fromOrder && <Badge color="secondary">{t('page.purchaseReceipts.status.fromOrder')}</Badge>}
                    </Colxx>
                  </Row>
                  {rows.length === 0
                    ? <p className="text-muted">{t('page.purchaseReceipts.noRows')}</p>
                    : (
                      <Table bordered size="sm" responsive>
                        <thead>
                          <tr>
                            <th>{t('page.purchaseReceipts.table.product')}</th>
                            <th>{t('page.purchaseReceipts.table.name')}</th>
                            <th>{t('page.purchaseReceipts.table.bonus')}</th>
                            <th>{t('page.purchaseReceipts.table.lot')}</th>
                            <th align="right">{t('page.purchaseReceipts.table.purchased')}</th>
                            <th align="right">{t('page.purchaseReceipts.table.received')}</th>
                            <th>{t('page.purchaseReceipts.table.expiration')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => (
                            <tr key={row.kardexId} className={ROW_CLASS[rowStatus(row)]}>
                              <th scope="row">{row.productCode}</th>
                              <td>{row.productName}</td>
                              <td>{row.isBonus ? <i className="bi bi-check-lg" /> : null}</td>
                              <td>{row.lotCode}</td>
                              <td align="right">{row.purchasedQty === null ? '' : formatNumber(row.purchasedQty)}</td>
                              <td align="right">
                                <input
                                  className={`form-control form-control-sm${invalid(row.kardexId, 'received') ? ' is-invalid' : ''}`}
                                  type="number" step="0.00001" min="0" value={row.received}
                                  onChange={(e) => fnChangeRow(row.kardexId, 'received', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  className={`form-control form-control-sm${invalid(row.kardexId, 'expiration') ? ' is-invalid' : ''}`}
                                  type="date" value={row.expiration}
                                  onChange={(e) => fnChangeRow(row.kardexId, 'expiration', e.target.value)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  <small className="text-muted">
                    <span className="badge bg-danger me-1">&nbsp;</span>{t('page.purchaseReceipts.legend.zero')}
                    <span className="badge bg-warning ms-3 me-1">&nbsp;</span>{t('page.purchaseReceipts.legend.differs')}
                  </small>
                </>
              )}
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalPurchases} />
      <Confirmation {...propsToMsgSave} />
    </>
  );
}

export default PurchaseReceipts;
