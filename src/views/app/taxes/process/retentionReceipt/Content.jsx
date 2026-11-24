import { Alert, Badge, Button, Card, CardBody, Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import ControlPanel from '@Components/controlPanel';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import { formatNumber } from '@Helpers/Utils';
import ModalInvoices from './ModalInvoices';
import ModalSearchRetention from './ModalSearchRetention';
import { lineTotal } from './retentionReceiptRules';
import { useRetentionReceipt } from './useRetentionReceipt';

// Comprobante de retención (SPEC v2-113-sr). Un solo useIntl arriba: IntlMessages es un hook y no se puede llamar en condiciones ni en map.
const RetentionReceipt = (props) => {
  const { setLoading } = props;
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);
  const {
    formState, onInputChange, onProviderChange, errors, sendForm, state, total, details, line, lineErrors, sendLine, onLineChange, onTypeChange,
    listDocuments, listProviders, listTypes, invoices, fnViewInvoices, fnSelectInvoice, fnAddLine, fnRemoveLine,
    propsToControlPanel, openSearch, setOpenSearch, fnLoadDocument, openInvoices, setOpenInvoices,
    openMsgCai, setOpenMsgCai, fnOkGenerateCai, openMsgAccount, setOpenMsgAccount, fnOkAccountDocument, openMsgCancel, setOpenMsgCancel, fnOkCancelDocument
  } = useRetentionReceipt({ setLoading });

  const { date, documentCode, documentId, cai, numberCAI, rangeCAI, limitDate, providerId, pdaNumber } = formState;
  // `feedbackText` de los campos recibe el id de traducción (el componente lo traduce).
  const show = (field) => (sendForm && errors[field] ? errors[field] : null);
  const showLine = (field) => (sendLine && lineErrors[field] ? lineErrors[field] : null);
  const locked = state.locked;

  const modalSearch = {
    ModalContent: ModalSearchRetention, title: 'page.retentionReceipt.modal.invoices.title', open: openSearch, setOpen: setOpenSearch, maxWidth: 'lg', data: { fnLoadDocument }
  };
  const modalInvoices = {
    ModalContent: ModalInvoices, title: 'page.retentionReceipt.modal.availableInvoices.title', open: openInvoices, setOpen: setOpenInvoices, maxWidth: 'lg', data: { invoices, fnSelectInvoice }
  };

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />

              {state.isVoided && <Alert color="danger" className="mb-2" data-testid="receipt-voided-notice"><i className="bi bi-slash-circle me-2" />{t('page.retentionReceipt.notice.voided')}</Alert>}
              {state.isPosted && !state.isVoided && (
                <Alert color="info" className="mb-2" data-testid="receipt-posted-notice"><i className="bi bi-lock me-2" />{t('page.retentionReceipt.notice.posted', { pda: pdaNumber })}</Alert>
              )}
              {state.saved && !state.isVoided && (
                <div className="mb-2">
                  <Badge color={state.hasCai ? 'success' : 'warning'}>{t(state.hasCai ? 'page.retentionReceipt.status.hasCai' : 'page.retentionReceipt.status.noCai')}</Badge>
                </div>
              )}

              <Row className="mb-2">
                <Colxx xxs="12" md="3">
                  <DateCalendar name="date" value={date} label="page.retentionReceipt.input.dateIn" onChange={onInputChange} disabled={locked}
                    invalid={!!show('date')} feedbackText={show('date')} />
                </Colxx>
                <Colxx xxs="12" md="3">
                  <SearchSelect name="documentCode" label="page.retentionReceipt.select.documentCode" inputValue={documentCode} onChange={onInputChange}
                    options={listDocuments} isDisabled={locked || state.hasCai} invalid={!!show('documentCode')} feedbackText={show('documentCode')} />
                </Colxx>
                <Colxx xxs="12" md="6">
                  <SearchSelect name="providerId" label="page.retentionReceipt.select.provider" inputValue={providerId} onChange={onProviderChange}
                    options={listProviders} isDisabled={locked} invalid={!!show('providerId')} feedbackText={show('providerId')} />
                </Colxx>
              </Row>
              <Row className="mb-2">
                <Colxx xxs="12" md="2"><InputField name="documentId" value={documentId} label="page.retentionReceipt.input.numInt" type="text" disabled /></Colxx>
                <Colxx xxs="12" md="3"><InputField name="numberCAI" value={numberCAI} label="page.retentionReceipt.input.numberCai" type="text" disabled /></Colxx>
                <Colxx xxs="12" md="3"><InputField name="cai" value={cai} label="page.retentionReceipt.input.cai" type="text" disabled /></Colxx>
                <Colxx xxs="12" md="2"><InputField name="rangeCAI" value={rangeCAI} label="page.retentionReceipt.input.rangeCai" type="text" disabled /></Colxx>
                <Colxx xxs="12" md="2"><DateCalendar name="limitDate" value={limitDate} label="page.retentionReceipt.input.limitDate" onChange={onInputChange} disabled /></Colxx>
              </Row>

              {!locked && (
                <>
                  <Separator className="mt-3 mb-3" />
                  <Row className="mb-2 align-items-start">
                    <Colxx xxs="12" md="3">
                      <InputField name="invoiceNumber" value={line.invoiceNumber} label="page.retentionReceipt.input.invoice" type="text" disabled
                        invalid={!!showLine('invoiceId')} feedbackText={showLine('invoiceId')} />
                    </Colxx>
                    <Colxx xxs="12" md="1" className="mb-2">
                      <Button color="primary" onClick={fnViewInvoices} title={t('page.retentionReceipt.button.selectInvoice')}><i className="bi bi-search" /></Button>
                    </Colxx>
                    <Colxx xxs="12" md="3">
                      <SearchSelect name="withholdingTypeId" label="page.retentionReceipt.select.type" inputValue={line.withholdingTypeId} onChange={onTypeChange}
                        options={listTypes} invalid={!!showLine('withholdingTypeId')} feedbackText={showLine('withholdingTypeId')} />
                    </Colxx>
                    <Colxx xxs="12" md="2">
                      <InputField name="baseValue" value={line.baseValue} label="page.retentionReceipt.input.baseValue" onChange={onLineChange} type="text"
                        invalid={!!showLine('baseValue')} feedbackText={showLine('baseValue')} />
                    </Colxx>
                    <Colxx xxs="12" md="1">
                      <InputField name="percentValue" value={line.percentValue} label="page.retentionReceipt.input.percentValue" onChange={onLineChange} type="text"
                        invalid={!!showLine('percentValue')} feedbackText={showLine('percentValue')} />
                    </Colxx>
                    <Colxx xxs="12" md="2">
                      <InputField name="totalValue" value={formatNumber(lineTotal(line.baseValue, line.percentValue), '', 2)} label="page.retentionReceipt.input.totalValue" type="text" disabled />
                    </Colxx>
                  </Row>
                  <Row className="mb-2">
                    <Colxx xxs="12" className="div-action-button-container">
                      <Button color="primary" onClick={fnAddLine}><i className="bi bi-plus-circle" /> {t('button.add')}</Button>
                    </Colxx>
                  </Row>
                </>
              )}

              <Separator className="mt-3 mb-3" />
              <div className="table-responsive">
                <table className="table table-sm" data-testid="receipt-lines">
                  <thead>
                    <tr>
                      <th>{t('page.retentionReceipt.table.Documentcode')}</th>
                      <th>{t('page.retentionReceipt.table.description')}</th>
                      <th className="text-end">{t('page.retentionReceipt.input.baseValue')}</th>
                      <th className="text-end">{t('page.retentionReceipt.input.percentValue')}</th>
                      <th className="text-end">{t('page.retentionReceipt.input.totalValue')}</th>
                      {!locked && <th />}
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((item, index) => (
                      <tr key={`${item.invoiceId}-${item.withholdingTypeId}`}>
                        <td>{item.invoiceNumber}</td>
                        <td>{item.description}</td>
                        <td className="text-end">{formatNumber(item.baseValue, '', 2)}</td>
                        <td className="text-end">{formatNumber(item.percentValue, '', 2)}</td>
                        <td className="text-end">{formatNumber(lineTotal(item.baseValue, item.percentValue), '', 2)}</td>
                        {!locked && <td className="text-end"><Button size="xs" color="danger" onClick={() => fnRemoveLine(index)} title={t('button.delete')}><i className="bi bi-trash" /></Button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sendForm && errors.details && <div className="text-danger mb-2">{t(errors.details)}</div>}
              <Row>
                <Colxx xxs="12" md={{ size: 3, offset: 9 }}>
                  <InputField name="total" value={formatNumber(state.isVoided ? 0 : total, '', 2)} label="page.retentionReceipt.input.total" type="text" disabled />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...modalSearch} />
      <Modal {...modalInvoices} />
      <Confirmation open={openMsgCai} setOpen={setOpenMsgCai} fnOnOk={fnOkGenerateCai} title="page.retentionReceipt.confirm.cai" />
      <Confirmation open={openMsgAccount} setOpen={setOpenMsgAccount} fnOnOk={fnOkAccountDocument} title="page.retentionReceipt.confirm.account" />
      <Confirmation open={openMsgCancel} setOpen={setOpenMsgCancel} fnOnOk={fnOkCancelDocument} title="page.retentionReceipt.confirm.cancel" />
    </>
  );
};

export default RetentionReceipt;
