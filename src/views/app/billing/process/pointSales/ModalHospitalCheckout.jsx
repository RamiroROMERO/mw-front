import { useEffect, useRef, useState } from "react";
import { Colxx } from "@Components/common/CustomBootstrap";
import { InputField } from "@Components/inputFields";
import { SimpleSelect } from "@Components/simpleSelect";
import { RadioGroup } from "@Components/radioGroup";
import { useForm } from "@Hooks";
import { Button, ModalBody, ModalFooter, Row, Table } from "reactstrap";
import { IntlMessages, formatNumber } from "@Helpers/Utils";
import { EditValuesTable } from "@Components/editValuesTable";
import { request, buildUrl, notifyError } from "@Helpers/core";
import createNotification from "@Containers/ui/Notifications";
import { formatCents, receivedAndChange } from "./posPaymentRules";
import { ADVANCES_PATH, advanceParams, applySummary, pendingParams, toggleSelection } from "./posAdvanceRules";
import {
  CHECKOUT_PATH, INSURERS_PATH, PREVIEW_DEBOUNCE_MS, buildHospitalCheckoutPayload, buildHospitalRows, buildPreviewParams, previewPath, validateHospitalCheckout
} from "./posHospitalRules";

const SALE_CASH = 1;

// Cobro de un evento hospitalario (SPEC v2-154-sr). Las líneas, el paciente, el copago y la parte de la aseguradora los calcula el servidor (vista previa que se renueva al cambiar
// la aseguradora, los gastos no elegibles, el deducible o el descuento): el cajero solo cobra el copago por las formas de pago (Contado) o factura a Crédito.
const ModalHospitalCheckout = (props) => {
  const { data, setOpen } = props;
  const { event, sessionId, listTypePayments, setListTypePayments, setLoading, fnCheckoutSuccess } = data;

  const { formState, onInputChange } = useForm({
    saleType: SALE_CASH,
    insuranceId: Number(event?.insuranceId) || 0,
    gne: '',
    deductible: '',
    discountPercent: '',
    receivedValue: '',
    notes: ''
  });
  const [insurers, setInsurers] = useState([]);
  const [preview, setPreview] = useState(null);
  const [advances, setAdvances] = useState([]);
  const [selectedAdvances, setSelectedAdvances] = useState([]);
  const latest = useRef(0);
  const { saleType, insuranceId, gne, deductible, discountPercent, receivedValue, notes } = formState;
  const isCash = Number(saleType) === SALE_CASH;

  useEffect(() => {
    request.GET(INSURERS_PATH, (resp) => setInsurers(resp.data || []), () => { });
  }, []);

  // Adelantos pendientes del paciente (SPEC v2-155-sr): solo en Contado se pueden aplicar.
  useEffect(() => {
    if (!(Number(event?.patientId) > 0)) return;
    request.GET(buildUrl(ADVANCES_PATH, pendingParams(event.patientId)), (resp) => setAdvances(resp.data || []), () => { });
  }, [event?.patientId]);

  // Vista previa del servidor con retraso; una respuesta vieja nunca pisa a una más nueva. Al llegar, el efectivo se prellena con el copago.
  useEffect(() => {
    latest.current += 1;
    const requestId = latest.current;
    const timer = setTimeout(() => {
      request.GET(buildUrl(previewPath(event.id), { ...buildPreviewParams({ insuranceId, gne, deductible, discountPercent, sessionId }), ...advanceParams(isCash ? selectedAdvances : []) }), (resp) => {
        if (requestId !== latest.current) return;
        setPreview(resp.data);
        setListTypePayments((current) => buildHospitalRows(current, resp.data.toPay ?? resp.data.copayment));
      }, (err) => {
        if (requestId !== latest.current) return;
        setPreview(null);
        notifyError(err, 'page.pointSales.hospital.msg.previewError');
      });
    }, PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id, insuranceId, gne, deductible, discountPercent, selectedAdvances, saleType]);

  const amounts = receivedAndChange(receivedValue, preview?.toPay ?? preview?.copayment ?? 0);
  const summary = applySummary({ copayment: preview?.copayment ?? 0, advances, selectedIds: isCash ? selectedAdvances : [] });
  const changeText = amounts ? formatCents(amounts.changeCents) : '0.00';

  const fnAccept = () => {
    if (!(Number(sessionId) > 0)) {
      createNotification('warning', 'msg.required.cashOpening', 'alert.warning.title');
      return;
    }
    if (summary.exceeds) {
      createNotification('warning', 'page.pointSales.advance.msg.exceeds', 'alert.warning.title');
      return;
    }
    const error = validateHospitalCheckout({ event, form: formState, preview: { ...preview, copayment: preview?.toPay ?? preview?.copayment }, rows: listTypePayments });
    if (error) {
      createNotification('warning', error, 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(CHECKOUT_PATH, { ...buildHospitalCheckoutPayload({ sessionId, event, form: formState, rows: listTypePayments }), advanceIds: isCash ? selectedAdvances : [] }, (resp) => {
      setLoading(false);
      setOpen(false);
      fnCheckoutSuccess(resp.data);
    }, () => {
      setLoading(false);
    });
  };

  // IntlMessages es un hook: todos los textos se piden siempre, arriba, nunca dentro de un map ni de una condición.
  const labels = {
    subtotal: IntlMessages('page.pointSales.hospital.preview.subtotal'),
    discount: IntlMessages('page.pointSales.hospital.preview.discount'),
    tax: IntlMessages('page.pointSales.hospital.preview.tax'),
    total: IntlMessages('page.pointSales.hospital.preview.total'),
    copayment: IntlMessages('page.pointSales.hospital.preview.copayment'),
    insurerPart: IntlMessages('page.pointSales.hospital.preview.insurerPart')
  };
  const pendingText = IntlMessages('page.pointSales.hospital.msg.previewPending');
  const acceptText = IntlMessages('button.accept');
  const advancesTitle = IntlMessages('page.pointSales.advance.apply.title');
  const advancesApplied = IntlMessages('page.pointSales.advance.apply.applied');
  const advancesToPay = IntlMessages('page.pointSales.advance.apply.toPay');
  const figures = preview ? ['subtotal', 'discount', 'tax', 'total', 'copayment', 'insurerPart'] : [];

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" md="6">
            <InputField name="eventLabel" label="page.pointSales.hospital.input.event" value={`${event.id} - ${event.patientName || ''}`} onChange={() => { }} type="text" disabled />
          </Colxx>
          <Colxx xxs="12" md="6">
            <SimpleSelect name="insuranceId" label="page.pointSales.hospital.input.insurance" value={insuranceId} onChange={onInputChange} options={insurers} />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" sm="4">
            <InputField name="gne" label="page.pointSales.hospital.input.gne" value={gne} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="4">
            <InputField name="deductible" label="page.pointSales.hospital.input.deductible" value={deductible} onChange={onInputChange} type="text" placeholder={formatNumber(event.deductible || 0)} />
          </Colxx>
          <Colxx xxs="12" sm="4">
            <InputField name="discountPercent" label="page.pointSales.hospital.input.discountPercent" value={discountPercent} onChange={onInputChange} type="text" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" md="6">
            <RadioGroup
              label="page.invoicing.title.salesType"
              name="saleType"
              value={saleType}
              onChange={onInputChange}
              options={[{ id: SALE_CASH, label: 'page.invoicing.radio.cash' }, { id: 2, label: 'page.invoicing.radio.credit' }]}
            />
          </Colxx>
          <Colxx xxs="12" md="6">
            <InputField name="notes" label="page.pointSales.hospital.input.notes" value={notes} onChange={onInputChange} type="text" />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Table size="sm" bordered className="mb-3">
              <tbody>
                {figures.map((key) => (
                  <tr key={key} style={key === 'copayment' || key === 'insurerPart' ? { fontWeight: 'bold' } : undefined}>
                    <td>{labels[key]}</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(preview[key])}</td>
                  </tr>
                ))}
                {!preview && <tr><td colSpan={2}>{pendingText}</td></tr>}
              </tbody>
            </Table>
          </Colxx>
        </Row>
        {isCash && advances.length > 0 && (
          <Row>
            <Colxx xxs="12">
              <h6>{advancesTitle}</h6>
              <Table size="sm" bordered className="mb-2">
                <tbody>
                  {advances.map((advance) => (
                    <tr key={advance.id}>
                      <td style={{ width: '1%' }}><input type="checkbox" checked={selectedAdvances.includes(advance.id)} onChange={() => setSelectedAdvances((current) => toggleSelection(current, advance.id))} /></td>
                      <td>{`${advance.documentCode}-${advance.documentId}`}</td>
                      <td>{advance.payments.map((payment) => payment.name).join(', ')}</td>
                      <td style={{ textAlign: 'right' }}>{formatNumber(advance.value)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold' }}><td colSpan={3}>{advancesApplied}</td><td style={{ textAlign: 'right' }}>{formatNumber(summary.applied)}</td></tr>
                  <tr style={{ fontWeight: 'bold' }}><td colSpan={3}>{advancesToPay}</td><td style={{ textAlign: 'right' }}>{formatNumber(summary.toPay)}</td></tr>
                </tbody>
              </Table>
            </Colxx>
          </Row>
        )}
        {isCash && (
          <>
            <Row>
              <Colxx xxs="12">
                <EditValuesTable
                  optionsTitle="page.pointSales.modal.payment.title.paymentMethod"
                  valuesTitle="page.pointSales.modal.payment.title.value"
                  totalTitle="page.pointSales.modal.payment.title.totalPM"
                  listOptions={listTypePayments}
                  setListValues={setListTypePayments}
                  showTotal
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12" xs="6" style={{ fontSize: '18px' }}>
                <InputField name="receivedValue" label="page.pointSales.modal.payment.input.valueCustomer" value={receivedValue} onChange={onInputChange} type="text" style={{ fontSize: '18px' }} />
              </Colxx>
              <Colxx xxs="12" xs="6" style={{ fontSize: '18px' }}>
                <InputField name="valueRestore" label="page.pointSales.modal.payment.input.valueRestore" value={changeText} onChange={() => { }} type="text" disabled style={{ fontSize: '28px', fontWeight: 'bold' }} />
              </Colxx>
            </Row>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAccept} disabled={!preview}>
          <i className="bi bi-check-lg" />{acceptText}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ModalHospitalCheckout;
