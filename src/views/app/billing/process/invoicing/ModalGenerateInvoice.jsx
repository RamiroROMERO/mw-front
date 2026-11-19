import { useEffect, useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Alert } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatNumber } from "@Helpers/Utils";
import { request, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import { RadioGroup } from "@Components/radioGroup";
import { ContainerWithLabel } from "@Components/containerWithLabel";
import { InputField } from "@Components/inputFields";
import DateCalendar from '@Components/dateCalendar';
import { printDocument } from '@Helpers/printDocument';
import notification from '@Containers/ui/Notifications';
import { creditWarningIds } from './invoicingRules';
import { invoicePrintOptions } from './invoicePrintRules';
import { PAYMENTS_PATH, needsPayments, buildRows, validatePayments, buildPayments } from './invoicePaymentRules';

const ModalGenerateInvoice = (props) => {
  const { data, setOpen } = props;
  const { id, subTotalValue, discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValueInvoice, total, currency, documentType,
    setLoading, onInputChangeIndex } = data;

  const [documentGenerated, setDocumentGenerated] = useState(false);
  const [stockShortages, setStockShortages] = useState([]);

  // Formas de pago de una venta de Contado (SPEC v2-76-sr): una fila por forma activa; la primera lleva el total. A Crédito no se piden.
  const askPayments = needsPayments(documentType);
  const [paymentRows, setPaymentRows] = useState([]);

  useEffect(() => {
    if (!askPayments) return;
    request.GET(PAYMENTS_PATH, (resp) => {
      setPaymentRows(buildRows(resp.data, total));
    }, () => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askPayments]);

  const onPaymentChange = (rowId, field, value) => {
    setPaymentRows((rows) => rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
  };

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    cai: "",
    numcai: "",
    range: "",
    dateOut: "",
    typeChange: "1.0000",
    exemptedCertificate: "",
    exemptedNumber: "",
    exemptedRecord: ""
  });

  const { cai, numcai, range, dateOut, typeChange, exemptedCertificate, exemptedNumber, exemptedRecord } = formState;

  // Genera el documento fiscal (CAI) y, en la misma transacción atómica del backend,
  // el kardex de salida, la partida contable y la CxC del cliente — reemplaza el flujo
  // anterior de "previsualizar número" + PUT suelto, que nunca contabilizaba nada.
  const fnGenerateInvoice = () => {
    if (askPayments) {
      const problem = validatePayments(paymentRows, total);
      if (problem) {
        notification('warning', problem, 'alert.warning.title');
        return;
      }
    }
    setLoading(true);
    setStockShortages([]);
    request.POST(`billing/process/invoices/generateFiscalDocument/${id}`, {
      exchangeRate: typeChange,
      exonerationOrderNumber: exemptedCertificate,
      exonerationSerial: exemptedNumber,
      exonerationRegistry: exemptedRecord,
      ...(askPayments ? { payments: buildPayments(paymentRows) } : {})
    }, (resp) => {
      const newDocument = {
        cai: resp.data.cai,
        numcai: resp.data.numcai,
        range: resp.data.range,
        dateOut: resp.data.dateOut
      }
      // Crédito del cliente: solo avisa (SPEC v2-73-sr).
      creditWarningIds(resp.data.warnings).forEach((warningId) => notification('warning', warningId, 'alert.warning.title'));
      setBulkForm(newDocument);
      setDocumentGenerated(true);
      onInputChangeIndex({ target: { name: 'documentId', value: resp.data.documentId } });
      onInputChangeIndex({ target: { name: 'numcai', value: resp.data.numcai } });
      // La factura recién generada se descarga por el GET de impresión del back (SPEC v2-74-sr).
      printDocument({ ...invoicePrintOptions({ id }), setLoading });
    }, (err) => {
      // Existencias insuficientes (fnValidExist del legacy): la descripción del back trae el listado de faltantes como texto JSON (equivalente a
      // fac_pos_no_exist.scx). Cualquier otro rechazo muestra su mensaje real (período cerrado, cuenta bloqueada, factura anulada, ...).
      const first = err?.messages?.[0];
      if (first?.message === 'stock.insufficient') {
        try {
          setStockShortages(JSON.parse(first.description) || []);
        } catch {
          setStockShortages([]);
        }
        notification('error', 'msg.error.generateFiscalDocument.stockInsufficient', 'alert.error.title');
      } else {
        notifyError(err, 'msg.error.generateFiscalDocument.generic');
      }
      setLoading(false);
    }, false);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" lg="10">
            <ContainerWithLabel label="page.invoicing.modal.generateInvoice.title.taxDocument">
              <Row>
                <Colxx xxs="12" md="6">
                  <InputField
                    value={cai}
                    name="cai"
                    disabled
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.cai"
                  />
                </Colxx>
                <Colxx xxs="12" md="6">
                  <InputField
                    value={typeChange}
                    name="typeChange"
                    disabled={documentGenerated}
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.exchangeRate"
                  />
                </Colxx>
                <Colxx xxs="12" md="6">
                  <InputField
                    value={numcai}
                    name="numcai"
                    disabled
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.number"
                  />
                </Colxx>
                <Colxx xxs="12" md="6">
                  <InputField
                    value={range}
                    name="range"
                    disabled
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.range"
                  />
                </Colxx>
                <Colxx xxs="12" md="6">
                  <DateCalendar
                    value={dateOut}
                    name="dateOut"
                    disabled
                    label="page.invoicing.modal.generateInvoice.input.dateExpiration"
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" lg="6">
                  <RadioGroup
                    label="page.invoicing.title.currency"
                    name="currency"
                    value={currency}
                    onChange={onInputChange}
                    options={
                      [
                        { id: 1, label: "page.invoicing.radio.lempira" },
                        { id: 2, label: "page.invoicing.radio.dollar" }
                      ]
                    }
                    disabled
                    display="flex"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs="12" lg="2">
            <Row>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={subTotalValue}
                  name="subTotalValue"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.input.subtotal"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={discount}
                  name="discount"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.input.discValue"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={subTotExoValue}
                  name="subTotExoValue"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.modal.generateInvoice.input.exonerated"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={subTotExeValue}
                  name="subTotExeValue"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.modal.generateInvoice.input.exempt"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={subtotTaxValue}
                  name="subtotTaxValue"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.modal.generateInvoice.input.taxed"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={taxValueInvoice}
                  name="taxValueInvoice"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.modal.generateInvoice.input.taxes"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="12">
                <InputField
                  value={total}
                  name="total"
                  disabled
                  onChange={onInputChange}
                  type="text"
                  label="page.invoicing.modal.generateInvoice.input.total"
                />
              </Colxx>
            </Row>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.invoicing.modal.generateInvoice.title.infoInvoice">
              <Row>
                <Colxx xxs="12" lg="6">
                  <InputField
                    value={exemptedCertificate}
                    name="exemptedCertificate"
                    disabled={documentGenerated}
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.orderNumber"
                  />
                </Colxx>
                <Colxx xxs="12" lg="6">
                  <InputField
                    value={exemptedNumber}
                    name="exemptedNumber"
                    disabled={documentGenerated}
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.certificateNumber"
                  />
                </Colxx>
                <Colxx xxs="12" lg="6">
                  <InputField
                    value={exemptedRecord}
                    id="exemptedRecord"
                    name="exemptedRecord"
                    disabled={documentGenerated}
                    onChange={onInputChange}
                    type="text"
                    label="page.invoicing.modal.generateInvoice.input.identificationNumber"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        {askPayments && (
          <Row>
            <Colxx xxs="12">
              <ContainerWithLabel label="page.invoicing.modal.generateInvoice.title.payments">
                {paymentRows.map((row) => (
                  <Row key={`payment-${row.id}`}>
                    <Colxx xxs="12" md="4">
                      <InputField value={row.name} name={`paymentName-${row.id}`} disabled onChange={() => {}} type="text" label="page.invoicing.modal.generateInvoice.input.paymentMethod" />
                    </Colxx>
                    <Colxx xxs="12" md="4">
                      <InputField value={row.value} name={`paymentValue-${row.id}`} disabled={documentGenerated} onChange={(e) => onPaymentChange(row.id, 'value', e.target.value)} type="text" label="page.invoicing.modal.generateInvoice.input.paymentValue" />
                    </Colxx>
                    <Colxx xxs="12" md="4">
                      <InputField value={row.reference} name={`paymentReference-${row.id}`} disabled={documentGenerated} onChange={(e) => onPaymentChange(row.id, 'reference', e.target.value)} type="text" maxLength={50} label="page.invoicing.modal.generateInvoice.input.paymentReference" />
                    </Colxx>
                  </Row>
                ))}
              </ContainerWithLabel>
            </Colxx>
          </Row>
        )}
        {stockShortages.length > 0 && (
          <Row>
            <Colxx xxs="12">
              <Alert color="danger">
                <strong>{IntlMessages("page.invoicing.modal.generateInvoice.stockShortages.title")}</strong>
                <ul className="mb-0">
                  {stockShortages.map((item, idx) => (
                    <li key={`shortage-${idx}`}>
                      {item.productCode} — {IntlMessages("page.invoicing.modal.generateInvoice.stockShortages.requested")}: {formatNumber(item.requested)}, {IntlMessages("page.invoicing.modal.generateInvoice.stockShortages.available")}: {formatNumber(item.available)}
                    </li>
                  ))}
                </ul>
              </Alert>
            </Colxx>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" disabled={documentGenerated} onClick={fnGenerateInvoice}>
          <i className="bi bi-arrow-clockwise" /> {IntlMessages("button.generate")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalGenerateInvoice;