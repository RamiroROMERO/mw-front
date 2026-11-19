import { useEffect } from "react";
import { Colxx } from "@Components/common/CustomBootstrap";
import { InputField } from "@Components/inputFields";
import { useForm } from "@Hooks";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages } from "@Helpers/Utils";
import { EditValuesTable } from "@Components/editValuesTable";
import { request } from "@Helpers/core";
import { ContainerWithLabel } from "@Components/containerWithLabel";
import createNotification from "@Containers/ui/Notifications";
import { buildCheckoutPayload, hasSession } from "./posCheckoutRules";
import { formatCents, receivedAndChange, validatePosPayment } from "./posPaymentRules";

const ModalPayment = (props) => {
  const { data, setOpen } = props;
  const { total, customerDNI, customerName, listTypePayments, setListTypePayments, setLoading, invoiceHeader, invoiceDetail, fnCheckoutSuccess, sessionId } = data;

  const { formState, onInputChange } = useForm({
    valueCustomer: '',
    newCustomerDNI: customerDNI,
    newCustomerName: customerName
  });

  const { valueCustomer, newCustomerDNI, newCustomerName } = formState;

  // La forma en efectivo (predeterminada) sale prellenada con el total y las demás vacías (SPEC v2-81-sr).
  useEffect(() => {
    setListTypePayments((current) => current.map((item) => ({ ...item, value: item.isDefault ? String(total) : '' })));
  }, []);

  const amounts = receivedAndChange(valueCustomer, total);
  const changeText = amounts ? formatCents(amounts.changeCents) : '0.00';

  const fnAcceptPay = () => {
    // Venta nueva: checkout atómico (SPEC v2-79-sr y v2-81-sr). Solo se envía lo que digita el cajero y la sesión de caja; el servidor calcula y valida todo.
    if (!hasSession({ sessionId })) {
      createNotification('warning', 'msg.required.cashOpening', 'alert.warning.title');
      return;
    }
    const paymentError = validatePosPayment({ rows: listTypePayments, total, receivedValue: valueCustomer });
    if (paymentError) {
      createNotification('warning', paymentError, 'alert.warning.title');
      return;
    }
    const checkoutPayload = buildCheckoutPayload({
      sessionId,
      header: { ...invoiceHeader, customerDNI: newCustomerDNI, customerName: newCustomerName },
      details: invoiceDetail,
      payments: listTypePayments,
      receivedValue: valueCustomer
    });

    setLoading(true);
    request.POST('billing/process/pointSales/checkout', checkoutPayload, (resp) => {
      setLoading(false);
      setOpen(false);
      fnCheckoutSuccess(resp.data);
    }, () => {
      setLoading(false);
    });
  }

  const propsToTableTypePayments = {
    optionsTitle: "page.pointSales.modal.payment.title.paymentMethod",
    valuesTitle: "page.pointSales.modal.payment.title.value",
    totalTitle: "page.pointSales.modal.payment.title.totalPM",
    listOptions: listTypePayments,
    setListValues: setListTypePayments,
    showTotal: true
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="select.customer">
              <Row>
                <Colxx xxs="12" xs="5">
                  <InputField
                    name="newCustomerDNI"
                    label="page.pointSales.modal.payment.input.dni"
                    value={newCustomerDNI}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
                <Colxx xxs="12" xs="7">
                  <InputField
                    name="newCustomerName"
                    label="page.pointSales.modal.payment.input.name"
                    value={newCustomerName}
                    onChange={onInputChange}
                    type="text"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="6" sm="6">
          </Colxx>
          <Colxx xxs="12" xs="6" sm="6" style={{ fontSize: '18px' }}>
            <InputField
              name="totalPay"
              label="page.pointSales.modal.payment.input.totalPay"
              value={total}
              onChange={onInputChange}
              type="text"
              disabled
              style={{ fontSize: '18px' }}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <EditValuesTable {...propsToTableTypePayments} />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="6" style={{ fontSize: '18px' }}>
            <InputField
              name="valueCustomer"
              label="page.pointSales.modal.payment.input.valueCustomer"
              value={valueCustomer}
              onChange={onInputChange}
              type="text"
              style={{ fontSize: '18px' }}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" style={{ fontSize: '18px' }}>
            <InputField
              name="valueRestore"
              label="page.pointSales.modal.payment.input.valueRestore"
              value={changeText}
              onChange={onInputChange}
              type="text"
              disabled
              style={{ fontSize: '28px', fontWeight: 'bold' }}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAcceptPay}>
          <i className="bi bi-check-lg" />{IntlMessages("button.accept")}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalPayment;