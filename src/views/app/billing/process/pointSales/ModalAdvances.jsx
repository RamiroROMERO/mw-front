import { useCallback, useEffect, useState } from "react";
import { Colxx } from "@Components/common/CustomBootstrap";
import { InputField } from "@Components/inputFields";
import { EditValuesTable } from "@Components/editValuesTable";
import { Button, ModalBody, ModalFooter, Row, Table } from "reactstrap";
import { IntlMessages, formatNumber, formatDate } from "@Helpers/Utils";
import { request, buildUrl } from "@Helpers/core";
import { printDocument } from "@Helpers/printDocument";
import createNotification from "@Containers/ui/Notifications";
import {
  ADVANCES_PATH, ADVANCE_PRINT_FILE, ADVANCE_HISTORY_FILE, buildAdvancePayload, emptyRows, pendingParams, validateAdvance, validateVoidReason, voidParams
} from "./posAdvanceRules";

// Adelantos de un paciente (SPEC v2-155-sr): los pendientes con su recibo y anulación (con motivo) y el registro de uno nuevo por las formas de pago. El valor es la suma de las formas;
// caja, cajero, fecha y partida los pone el servidor.
const ModalAdvances = (props) => {
  const { data, setOpen } = props;
  const { customer, sessionId, listTypePayments, setLoading } = data;

  const [rows, setRows] = useState(() => emptyRows(listTypePayments));
  const [formKey, setFormKey] = useState(0); // la tabla de formas de pago guarda su propio total: se vuelve a montar al limpiar
  const [pending, setPending] = useState([]);
  const [voidId, setVoidId] = useState(0);
  const [reason, setReason] = useState('');

  const load = useCallback(() => {
    request.GET(buildUrl(ADVANCES_PATH, pendingParams(customer.id)), (resp) => setPending(resp.data || []), () => { });
  }, [customer.id]);

  useEffect(() => { load(); }, [load]);

  const fnSave = () => {
    if (!(Number(sessionId) > 0)) {
      createNotification('warning', 'msg.required.cashOpening', 'alert.warning.title');
      return;
    }
    const error = validateAdvance({ customerId: customer.id, rows });
    if (error) {
      createNotification('warning', error, 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(ADVANCES_PATH, buildAdvancePayload({ sessionId, customerId: customer.id, rows }), (resp) => {
      setLoading(false);
      setRows(emptyRows(rows));
      setFormKey((current) => current + 1);
      load();
      printDocument({ path: ADVANCES_PATH, id: resp.data.id, fileName: ADVANCE_PRINT_FILE, setLoading });
    }, () => setLoading(false));
  };

  const fnPrint = (id) => printDocument({ path: ADVANCES_PATH, id, fileName: ADVANCE_PRINT_FILE, setLoading });

  const fnPrintHistory = () => {
    setLoading(true);
    request.GETPdf(`${ADVANCES_PATH}/history`, pendingParams(customer.id), ADVANCE_HISTORY_FILE, () => setLoading(false), 'GET', () => setLoading(false));
  };

  const fnVoid = () => {
    const error = validateVoidReason(reason);
    if (error) {
      createNotification('warning', error, 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.DELETE(buildUrl(`${ADVANCES_PATH}/${voidId}`, voidParams(reason)), () => {
      setLoading(false);
      setVoidId(0);
      setReason('');
      load();
    }, () => setLoading(false));
  };

  // IntlMessages es un hook: todos los textos se piden siempre, arriba, nunca dentro de un map ni de una condición.
  const t = {
    pending: IntlMessages('page.pointSales.advance.pending'),
    none: IntlMessages('page.pointSales.advance.none'),
    date: IntlMessages('page.invoicing.table.date'),
    document: IntlMessages('page.pointSales.advance.table.document'),
    value: IntlMessages('page.invoicing.table.value'),
    payments: IntlMessages('page.pointSales.advance.table.payments'),
    newAdvance: IntlMessages('page.pointSales.advance.new'),
    save: IntlMessages('page.pointSales.advance.button.save'),
    print: IntlMessages('page.pointSales.advance.button.print'),
    voidIt: IntlMessages('page.pointSales.advance.button.void'),
    history: IntlMessages('page.pointSales.advance.button.history'),
    confirmVoid: IntlMessages('page.pointSales.advance.button.confirmVoid'),
    cancel: IntlMessages('button.cancel'),
    close: IntlMessages('button.exit')
  };
  const total = pending.reduce((sum, advance) => sum + Math.round(advance.value * 100), 0) / 100;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField name="patient" label="page.pointSales.hospital.table.patient" value={customer.name} onChange={() => { }} type="text" disabled />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <h6>{t.pending}</h6>
            <Table size="sm" bordered className="mb-3">
              <thead>
                <tr><th>{t.date}</th><th>{t.document}</th><th>{t.payments}</th><th style={{ textAlign: 'right' }}>{t.value}</th><th style={{ width: '1%' }} /></tr>
              </thead>
              <tbody>
                {pending.map((advance) => (
                  <tr key={advance.id}>
                    <td>{formatDate(advance.date)}</td>
                    <td>{`${advance.documentCode}-${advance.documentId}`}</td>
                    <td>{advance.payments.map((payment) => payment.name).join(', ')}</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(advance.value)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Button color="link" size="sm" title={t.print} onClick={() => fnPrint(advance.id)}><i className="bi bi-printer" /></Button>
                      {Number(advance.closeId) === 0 && <Button color="link" size="sm" title={t.voidIt} onClick={() => { setVoidId(advance.id); setReason(''); }}><i className="bi bi-x-circle" /></Button>}
                    </td>
                  </tr>
                ))}
                {pending.length === 0 && <tr><td colSpan={5}>{t.none}</td></tr>}
                {pending.length > 0 && <tr style={{ fontWeight: 'bold' }}><td colSpan={3}>TOTAL</td><td style={{ textAlign: 'right' }}>{formatNumber(total)}</td><td /></tr>}
              </tbody>
            </Table>
          </Colxx>
        </Row>
        {voidId > 0 && (
          <Row>
            <Colxx xxs="12" md="9">
              <InputField name="reason" label="page.pointSales.modal.voidInvoice.input.reason" value={reason} onChange={(event) => setReason(event.target.value)} type="text" />
            </Colxx>
            <Colxx xxs="12" md="3" className="d-flex align-items-center">
              <Button color="danger" onClick={fnVoid} className="me-2">{t.confirmVoid}</Button>
              <Button color="secondary" outline onClick={() => setVoidId(0)}>{t.cancel}</Button>
            </Colxx>
          </Row>
        )}
        <Row>
          <Colxx xxs="12">
            <h6>{t.newAdvance}</h6>
            <EditValuesTable
              key={formKey}
              optionsTitle="page.pointSales.modal.payment.title.paymentMethod"
              valuesTitle="page.pointSales.modal.payment.title.value"
              totalTitle="page.pointSales.modal.payment.title.totalPM"
              listOptions={rows}
              setListValues={setRows}
              showTotal
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={fnPrintHistory} disabled={pending.length === 0}><i className="bi bi-printer" />{t.history}</Button>
        <Button color="primary" onClick={fnSave}><i className="bi bi-check-lg" />{t.save}</Button>
        <Button color="secondary" onClick={() => setOpen(false)}>{t.close}</Button>
      </ModalFooter>
    </>
  );
};

export default ModalAdvances;
