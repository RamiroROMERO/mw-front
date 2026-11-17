import { Card, CardBody, Row, Button, Input, Table } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx } from '@Components/common/CustomBootstrap';
import { formatNumber } from '@Helpers/Utils';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useCostAdjustment } from './useCostAdjustment';
import { MAX_REASON, rowNotice } from './costAdjustmentRules';

// Ajuste de costos y cantidades del kardex (SPEC v2-56-sr). Guardar solo se ofrece con 11.01.033 (`canAdjust`); el back vuelve a exigirlo.
// Los textos se piden con un solo useIntl arriba: nunca dentro de condiciones ni de map.
const CostAdjustment = ({ setLoading, canAdjust }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const {
    listStores, storeId, fnStoreChange, product, productOptions, onProductSearch, fnProductChange, dateFrom, setDateFrom, dateTo, setDateTo,
    filterValidation, sendFilter, rows, searched, fnSearch, fnRowChange, edited, rowErrors, reason, setReason, reasonError, sendSave,
    fnAskSave, openConfirm, setOpenConfirm, fnConfirmSave, result
  } = useCostAdjustment({ setLoading });
  const { storeIdValid, productCodeValid, dateFromValid, dateToValid } = filterValidation;
  const invalid = (id, field) => Boolean(sendSave && rowErrors[id] && rowErrors[id][field]);

  const propsToConfirm = {
    open: openConfirm,
    setOpen: setOpenConfirm,
    fnOnOk: fnConfirmSave,
    title: 'page.costAdjustment.msg.confirmSave.title'
  };

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card className="mb-3">
            <CardBody>
              <Row>
                <Colxx xxs="12" md="4">
                  <SearchSelect
                    label="select.storeId"
                    name="storeId"
                    inputValue={storeId}
                    options={listStores}
                    onChange={fnStoreChange}
                    invalid={sendFilter && !!storeIdValid}
                    feedbackText={sendFilter && (storeIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" md="8">
                  <SearchSelect
                    label="page.costAdjustment.input.product"
                    name="productCode"
                    inputValue={product?.code || ''}
                    options={productOptions}
                    onChange={fnProductChange}
                    onInputChange={onProductSearch}
                    invalid={sendFilter && !!productCodeValid}
                    feedbackText={sendFilter && (productCodeValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="6" md="3">
                  <DateCalendar
                    name="dateFrom"
                    label="page.costAdjustment.input.dateFrom"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    invalid={sendFilter && !!dateFromValid}
                    feedbackText={sendFilter && (dateFromValid || null)}
                  />
                </Colxx>
                <Colxx xxs="6" md="3">
                  <DateCalendar
                    name="dateTo"
                    label="page.costAdjustment.input.dateTo"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    invalid={sendFilter && !!dateToValid}
                    feedbackText={sendFilter && (dateToValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" md="6" className="div-action-button-container align-items-end">
                  <Button color="info" onClick={fnSearch}>
                    <i className="bi bi-search" /> {t('page.costAdjustment.button.viewDetail')}
                  </Button>
                  {canAdjust && searched && (
                    <Button color="primary" onClick={fnAskSave}>
                      <i className="iconsminds-save" /> {t('button.save')}
                    </Button>
                  )}
                </Colxx>
              </Row>
              {canAdjust && searched && (
                <Row>
                  <Colxx xxs="12">
                    <InputField
                      name="reason"
                      label="page.costAdjustment.input.reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={MAX_REASON}
                      invalid={sendSave && !!reasonError}
                      feedbackText={sendSave && (reasonError || null)}
                    />
                  </Colxx>
                </Row>
              )}
            </CardBody>
          </Card>

          {searched && (
            <>
              <p className="text-warning" id="costAdjustmentNotice">
                <i className="bi bi-exclamation-triangle-fill" /> {t('page.costAdjustment.notice.general')}
              </p>
              {result && (
                <p className="text-success" id="costAdjustmentResult">
                  <i className="bi bi-check-circle-fill" /> {t('page.costAdjustment.result.updated')}: {result.updated} | {t('page.costAdjustment.result.unchanged')}: {result.unchanged} | {t('page.costAdjustment.result.existence')}: {formatNumber(result.existence, '', 2)}
                </p>
              )}
              <Table bordered hover size="sm" responsive>
                <thead>
                  <tr>
                    <th>{t('page.costAdjustment.table.date')}</th>
                    <th>{t('page.costAdjustment.table.document')}</th>
                    <th>{t('page.costAdjustment.table.number')}</th>
                    <th>{t('page.costAdjustment.table.type')}</th>
                    <th>{t('page.costAdjustment.table.cost')}</th>
                    <th>{t('page.costAdjustment.table.debitQty')}</th>
                    <th>{t('page.costAdjustment.table.debitValue')}</th>
                    <th>{t('page.costAdjustment.table.creditQty')}</th>
                    <th>{t('page.costAdjustment.table.creditValue')}</th>
                    <th>{t('page.costAdjustment.table.notice')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const notice = rowNotice(row);
                    const locked = !row.editable || !canAdjust;
                    return (
                      <tr key={row.id} className={row.editable ? '' : 'table-secondary'}>
                        <td>{row.date}</td>
                        <td>{row.documentCode}</td>
                        <td>{row.documentId}</td>
                        <td>{row.documentType}</td>
                        <td>
                          <Input bsSize="sm" type="number" value={row.costValue} disabled={locked} invalid={invalid(row.id, 'costValue')}
                            onChange={(e) => fnRowChange(row.id, 'costValue', e.target.value)} />
                        </td>
                        <td>
                          <Input bsSize="sm" type="number" value={row.debitQty} disabled={locked} invalid={invalid(row.id, 'debitQty')}
                            onChange={(e) => fnRowChange(row.id, 'debitQty', e.target.value)} />
                        </td>
                        <td align="right">{formatNumber(row.debitValue)}</td>
                        <td>
                          <Input bsSize="sm" type="number" value={row.creditQty} disabled={locked} invalid={invalid(row.id, 'creditQty')}
                            onChange={(e) => fnRowChange(row.id, 'creditQty', e.target.value)} />
                        </td>
                        <td align="right">{formatNumber(row.creditValue)}</td>
                        <td>
                          {notice ? (
                            <span className={row.editable ? 'text-warning' : 'text-muted'}>
                              <i className={row.editable ? 'bi bi-exclamation-triangle' : 'bi bi-lock-fill'} /> {t(notice)}
                            </span>
                          ) : ''}
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center">{t('table.noDataAvailable')}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {sendSave && Object.keys(rowErrors).length > 0 && (
                <p className="text-danger">{t('page.costAdjustment.error.rowsInvalid')} ({edited.length})</p>
              )}
            </>
          )}
        </Colxx>
      </Row>
      <Confirmation {...propsToConfirm} />
    </>
  );
}
export default CostAdjustment;
