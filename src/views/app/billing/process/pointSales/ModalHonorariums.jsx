import { useCallback, useEffect, useRef, useState } from "react";
import { Colxx } from "@Components/common/CustomBootstrap";
import { InputField } from "@Components/inputFields";
import { SimpleSelect } from "@Components/simpleSelect";
import SearchSelect from "@Components/SearchSelect/SearchSelect";
import { Button, ModalBody, ModalFooter, Row, Table } from "reactstrap";
import { IntlMessages, formatNumber, formatDate } from "@Helpers/Utils";
import { request, buildUrl } from "@Helpers/core";
import createNotification from "@Containers/ui/Notifications";
import { isUserSearch, isLatestRequest, SEARCH_DEBOUNCE_MS } from "../../../inventory/settings/productsCatalog/pagingRules";
import {
  HONORARIUMS_PATH, HONORARIUM_PROVIDERS_PATH, buildReceiptPayload, canVoid, defaultTypeTax, emptyForm, listParams, providerOptions, validateReceipt, validateVoidReason, voidParams
} from "./posHonorariumRules";

// Recibos de honorarios de un evento (SPEC v2-156-sr): los ya registrados (con anulación y motivo) y el alta de uno nuevo. Al crear se guarda y contabiliza (a crédito, sin impuesto);
// la retención se hace al pagar, con el Comprobante de retención.
const ModalHonorariums = (props) => {
  const { data, setOpen } = props;
  const { event, sessionId, setLoading } = data;

  const [form, setForm] = useState(() => emptyForm(event.id, 0));
  const [receipts, setReceipts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [taxTypes, setTaxTypes] = useState([]);
  const [voidId, setVoidId] = useState(0);
  const [reason, setReason] = useState('');
  const latest = useRef(0);
  const timer = useRef(null);

  const onChange = (event_) => {
    const { name, value } = event_.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const loadReceipts = useCallback(() => {
    request.GET(buildUrl(HONORARIUMS_PATH, listParams(event.id)), (resp) => setReceipts(resp.data || []), () => { });
  }, [event.id]);

  const loadProviders = useCallback((text) => {
    latest.current += 1;
    const requestId = latest.current;
    request.GET(buildUrl(HONORARIUM_PROVIDERS_PATH, { search: text || undefined, limit: 50 }), (resp) => {
      if (isLatestRequest(requestId, latest.current)) setProviders(providerOptions(resp?.data));
    }, () => { });
  }, []);

  const onProviderSearch = useCallback((text, meta) => {
    if (isUserSearch(meta)) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => loadProviders(text), SEARCH_DEBOUNCE_MS);
    }
    return text;
  }, [loadProviders]);

  useEffect(() => {
    loadReceipts();
    loadProviders('');
    request.GET('accounting/settings/accountants/getSL', (resp) => setAccounts([{ value: '0', label: 'Seleccione' }, ...(resp.data || []).map((item) => ({ value: item.cta, label: `${item.cta} - ${item.nombre}` }))]), () => { });
    request.GET('admin/paymentTypes/getForDocuments', (resp) => setPaymentTypes([...(resp.data || []).filter((item) => item.usageType === 2 || item.usageType === 3).map((item) => ({ value: item.id, label: item.name }))]), () => { });
    request.GET('admin/taxStatNames/getSL?shopping=1', (resp) => {
      const list = (resp.data || []).map((item) => ({ value: item.id, label: item.name }));
      setTaxTypes(list);
      setForm((current) => ({ ...current, typeTax: current.typeTax || defaultTypeTax(list) }));
    }, () => { });
    return () => clearTimeout(timer.current);
  }, [loadReceipts, loadProviders]);

  const fnSave = () => {
    if (!(Number(sessionId) > 0)) {
      createNotification('warning', 'msg.required.cashOpening', 'alert.warning.title');
      return;
    }
    const error = validateReceipt(form);
    if (error) {
      createNotification('warning', error, 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(HONORARIUMS_PATH, buildReceiptPayload({ sessionId, form }), () => {
      setLoading(false);
      setForm((current) => ({ ...emptyForm(event.id, current.typeTax), expenseCtaCode: current.expenseCtaCode, paymentTypeId: current.paymentTypeId }));
      loadReceipts();
    }, () => setLoading(false));
  };

  const fnVoid = () => {
    const error = validateVoidReason(reason);
    if (error) {
      createNotification('warning', error, 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.DELETE(buildUrl(`${HONORARIUMS_PATH}/${voidId}`, voidParams(reason)), () => {
      setLoading(false);
      setVoidId(0);
      setReason('');
      loadReceipts();
    }, () => setLoading(false));
  };

  // IntlMessages es un hook: todos los textos se piden siempre, arriba, nunca dentro de un map ni de una condición.
  const t = {
    list: IntlMessages('page.pointSales.honorarium.list'),
    none: IntlMessages('page.pointSales.honorarium.none'),
    date: IntlMessages('page.invoicing.table.date'),
    doctor: IntlMessages('page.pointSales.honorarium.table.doctor'),
    receipt: IntlMessages('page.pointSales.honorarium.table.receipt'),
    document: IntlMessages('page.pointSales.advance.table.document'),
    value: IntlMessages('page.invoicing.table.value'),
    voided: IntlMessages('page.pointSales.honorarium.table.voided'),
    voidIt: IntlMessages('page.pointSales.honorarium.button.void'),
    confirmVoid: IntlMessages('page.pointSales.honorarium.button.confirmVoid'),
    newReceipt: IntlMessages('page.pointSales.honorarium.new'),
    save: IntlMessages('page.pointSales.honorarium.button.save'),
    note: IntlMessages('page.pointSales.honorarium.note'),
    cancel: IntlMessages('button.cancel'),
    exit: IntlMessages('button.exit')
  };

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField name="eventLabel" label="page.pointSales.hospital.input.event" value={`${event.id} - ${event.patientName || ''}`} onChange={() => { }} type="text" disabled />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <h6>{t.list}</h6>
            <Table size="sm" bordered className="mb-3">
              <thead>
                <tr><th>{t.date}</th><th>{t.document}</th><th>{t.doctor}</th><th>{t.receipt}</th><th style={{ textAlign: 'right' }}>{t.value}</th><th style={{ width: '1%' }} /></tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id} style={canVoid(receipt) ? undefined : { textDecoration: 'line-through', opacity: 0.6 }}>
                    <td>{formatDate(receipt.date)}</td>
                    <td>{receipt.document}</td>
                    <td>{receipt.providerName}</td>
                    <td>{receipt.invoiceNumber}</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(receipt.total)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {canVoid(receipt)
                        ? <Button color="link" size="sm" title={t.voidIt} onClick={() => { setVoidId(receipt.id); setReason(''); }}><i className="bi bi-x-circle" /></Button>
                        : <span>{t.voided}</span>}
                    </td>
                  </tr>
                ))}
                {receipts.length === 0 && <tr><td colSpan={6}>{t.none}</td></tr>}
              </tbody>
            </Table>
          </Colxx>
        </Row>
        {voidId > 0 && (
          <Row>
            <Colxx xxs="12" md="9">
              <InputField name="reason" label="page.pointSales.modal.voidInvoice.input.reason" value={reason} onChange={(event_) => setReason(event_.target.value)} type="text" />
            </Colxx>
            <Colxx xxs="12" md="3" className="d-flex align-items-center">
              <Button color="danger" onClick={fnVoid} className="me-2">{t.confirmVoid}</Button>
              <Button color="secondary" outline onClick={() => setVoidId(0)}>{t.cancel}</Button>
            </Colxx>
          </Row>
        )}
        <Row>
          <Colxx xxs="12"><h6>{t.newReceipt}</h6></Colxx>
          <Colxx xxs="12" md="6">
            <SearchSelect
              label="page.pointSales.honorarium.input.doctor"
              name="providerId"
              inputValue={form.providerId}
              options={providers}
              onInputChange={onProviderSearch}
              onChange={onChange}
            />
          </Colxx>
          <Colxx xxs="12" md="3">
            <InputField name="invoiceNumber" label="page.pointSales.honorarium.input.receipt" value={form.invoiceNumber} onChange={onChange} type="text" maxLength={20} />
          </Colxx>
          <Colxx xxs="12" md="3">
            <InputField name="total" label="page.pointSales.honorarium.input.total" value={form.total} onChange={onChange} type="text" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField name="description" label="page.pointSales.honorarium.input.description" value={form.description} onChange={onChange} type="text" maxLength={250} />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" md="4">
            <SearchSelect label="page.pointSales.honorarium.input.account" name="expenseCtaCode" inputValue={form.expenseCtaCode} options={accounts} onChange={onChange} />
          </Colxx>
          <Colxx xxs="12" md="4">
            <SimpleSelect name="paymentTypeId" label="page.pointSales.honorarium.input.payment" value={form.paymentTypeId} onChange={onChange} options={paymentTypes} getOptionValue={(option) => option.value} getOptionLabel={(option) => option.label} />
          </Colxx>
          <Colxx xxs="12" md="4">
            <SimpleSelect name="typeTax" label="page.pointSales.honorarium.input.typeTax" value={form.typeTax} onChange={onChange} options={taxTypes} getOptionValue={(option) => option.value} getOptionLabel={(option) => option.label} />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12"><small>{t.note}</small></Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}><i className="bi bi-check-lg" />{t.save}</Button>
        <Button color="secondary" onClick={() => setOpen(false)}>{t.exit}</Button>
      </ModalFooter>
    </>
  );
};

export default ModalHonorariums;
