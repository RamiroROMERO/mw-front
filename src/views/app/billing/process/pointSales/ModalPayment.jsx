import { Colxx } from "@Components/common/CustomBootstrap";
import { InputField } from "@Components/inputFields";
import { useForm } from "@Hooks";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages, validFloat } from "@Helpers/Utils";
import { EditValuesTable } from "@Components/editValuesTable";
import { request } from "@Helpers/core";
import { ContainerWithLabel } from "@Components/containerWithLabel";
import createNotification from "@Containers/ui/Notifications";

const ModalPayment = (props) => {
  const { data, setOpen } = props;
  const { id, dateInProcess, total, cashId, cashierId, customerId, customerDNI, customerName, userName, typePrint, listTypePayments, setListTypePayments,
    setLoading, invoiceHeader, invoiceDetail, fnCheckoutSuccess } = data;

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    valueCustomer: 0,
    valueRestore: validFloat(total),
    newCustomerDNI: customerDNI,
    newCustomerName: customerName
  });

  const { valueCustomer, valueRestore, newCustomerDNI, newCustomerName } = formState;

  const handleInputChange = e => {
    const totalRestore = validFloat(e.target.value) - validFloat(total);
    const newValue = {
      valueCustomer: e.target.value,
      valueRestore: totalRestore
    }
    setBulkForm(newValue);
  }

  const fnAcceptPay = () => {
    const totalPayMethod = listTypePayments.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
    if (totalPayMethod !== validFloat(total)) {
      createNotification('warning', 'msg.required.input.totalPayMethod', 'alert.warning.title');
      return;
    }
    if (valueCustomer === 0) {
      createNotification('warning', 'msg.required.input.totalCustomer', 'alert.warning.title');
      return;
    }
    const updatePay = {
      valueCustomer,
      valueRestore,
      customerDNI: newCustomerDNI,
      customerName: newCustomerName
    }

    if (id && id > 0) {
      // Pago de una factura ya guardada — fuera del checkout atómico de creación.
      setLoading(true);
      request.PUT(`billing/process/invoices/${id}`, updatePay, () => {
        const dataPrint = {
          id, userName, typePrint
        }
        setLoading(true);
        request.GETPdf('billing/process/invoices/exportInvoicePDF', dataPrint, 'Factura Detallada.pdf', (err) => {

          setLoading(false);
        });
      }, (err) => {

        setLoading(false);
      });
      setLoading(true);
      listTypePayments.forEach(item => {
        if (validFloat(item.value) > 0) {
          const payMethod = {
            idFather: id,
            paymentMethodId: item.id,
            date: dateInProcess,
            cashId,
            cashierId,
            value: validFloat(item.value),
            customerId
          }
          request.POST('billing/process/invoicePayments', payMethod, () => {
            setLoading(false);
          }, (err) => {
            setLoading(false);
          }, false);
        }
      });
      setOpen(false);
      return;
    }

    // Venta nueva: checkout atómico — valida stock, genera factura, detalle, kardex,
    // partida contable y CxC en una sola transacción (todo o nada).
    const paymentMethods = listTypePayments
      .filter(item => validFloat(item.value) > 0)
      .map(item => ({ paymentTypeDetailId: item.id, total: validFloat(item.value), reference: '' }));

    const checkoutPayload = {
      invoice: {
        ...invoiceHeader,
        valueCustomer,
        valueRestore,
        customerDNI: newCustomerDNI,
        customerName: newCustomerName
      },
      detail: invoiceDetail,
      paymentMethods
    }

    setLoading(true);
    request.POST('billing/process/pointSales/checkout', checkoutPayload, (resp) => {
      setLoading(false);
      setOpen(false);
      fnCheckoutSuccess(resp.data);
    }, (err) => {
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
              onChange={handleInputChange}
              type="text"
              style={{ fontSize: '18px' }}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" style={{ fontSize: '18px' }}>
            <InputField
              name="valueRestore"
              label="page.pointSales.modal.payment.input.valueRestore"
              value={valueRestore}
              onChange={onInputChange}
              type="text"
              disabled
              style={{ fontSize: '18px' }}
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