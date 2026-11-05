import { useEffect, useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { RadioGroup } from '@Components/radioGroup'
import { ReactTableEdit } from "@Components/reactTableEdit";
import { IntlMessages, validFloat, validInt } from '@Helpers/Utils'
import { useForm } from '@Hooks'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
// import ReactInputMask from 'react-input-mask';
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { request } from '@Helpers/core';
import { buildProcessOrderPayload } from '../purchases/purchaseRules';

const ModalProcessOrder = ({ data, setOpen }) => {
  const { purchaseOrderId, providerId, paymentTypeId, requestedBy, description, listTypeDocument, listProviders, listLedgerAccounts,
    orderDetail, setOrderDetail, setLoading, workOrderId, listWorkOrders, valueOthers, fnGetDocuments, fnViewOrderDetail } = data;
  const [dataProducts, setDataProducts] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const filterProv = listProviders.filter((item) => {
    return item.value === validInt(providerId);
  });

  const purchaseOrdersValid = {
    documentCode: [(val) => val !== "", "msg.required.input.codeProduct"],
    cai: [(val) => val !== "", "msg.required.input.numInvoice"],
    invoiceNumber: [(val) => val !== "", "msg.required.input.numInvoice"],
    date: [(val) => val !== "", "msg.required.input.date"],
    dateOut: [(val) => val !== "", "msg.required.input.date"],
    idProvider: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    typeFp: [(val) => validInt(val) > 0, "msg.required.select.typePurchase"],
    total: [(val) => validInt(val) > 0, "msg.required.input.totalOrderProcess"],
    expenseCtaCode: [(val) => val !== "", "msg.required.select.noCtaExpense"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    documentCode: "",
    documentId: 0,
    idProvider: providerId,
    cai: filterProv[0].cai !== '' ? filterProv[0].cai : '',
    invoiceNumber: '',
    providerType: filterProv[0].providerType ? filterProv[0].providerType : 0,
    date: '',
    dateOut: '',
    expenseCtaCode: '',
    subTotal: 0,
    valueExempt: 0,
    valueTaxable: 0,
    valueExonerated: 0,
    discount: 0,
    tax: 0,
    otherCharges: validFloat(valueOthers),
    freight: 0,
    total: 0,
    typeFp: 0,
  }, purchaseOrdersValid);

  const { id, documentCode, idProvider, providerType, cai, invoiceNumber, date, dateOut, expenseCtaCode, subTotal, valueExempt, valueTaxable, valueExonerated,
    discount, tax, otherCharges, freight, total, typeFp } = formState;

  const { documentCodeValid, caiValid, invoiceNumberValid, dateValid, dateOutValid, idProviderValid, typeFpValid, totalValid,
    expenseCtaCodeValid } = formValidation;

  const [table, setTable] = useState({
    title: "",
    columns: [
      {
        label: "page.purchaseOrders.input.productCode", field: "productCode",
        headerStyle: {
          textAlign: 'center',
          width: '15%'
        },
        bodyStyle: {
          width: '15%'
        }
      },
      {
        label: "page.purchaseOrders.input.nameProduct", field: "nameProduct",
        headerStyle: {
          textAlign: 'center',
          width: '40%'
        },
        bodyStyle: {
          width: '40%'
        }
      },
      {
        label: "page.purchaseOrders.modal.process.table.qtyMissing", field: "qtyMissing",
        headerStyle: {
          textAlign: 'center',
          width: '15%'
        },
        bodyStyle: {
          width: '15%',
          textAlign: "right"
        }
      },
      {
        label: "page.purchaseOrders.modal.process.table.qtyReceived", field: "qtyRec", isEditable: true,
        headerStyle: {
          textAlign: 'center',
          width: '15%'
        },
        bodyStyle: {
          width: '15%'
        }
      },
      {
        label: "page.purchaseOrders.modal.process.table.cost", field: "price", isEditable: true,
        headerStyle: {
          textAlign: 'center',
          width: '15%'
        },
        bodyStyle: {
          width: '15%'
        }
      }
    ],
    data: orderDetail,
    onChangeData: setOrderDetail,
    options: {
      columnActions: "options",
      tableHeight: '100px'
    }
  });

  const onOtherChargesChange = e => {
    const newTotal = subTotal + validFloat(e.target.value) + tax + freight - discount;

    const newValue = {
      total: newTotal,
      otherCharges: validFloat(e.target.value)
    }
    setBulkForm(newValue);
  }

  const onFreightChange = e => {
    const newTotal2 = subTotal + validFloat(e.target.value) + tax + otherCharges - discount;

    const newValue2 = {
      total: newTotal2,
      freight: validFloat(e.target.value)
    }
    setBulkForm(newValue2);
  }

  const fnSaveProcessOrder = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    // Una sola llamada: el back crea la compra (cerrada y sin almacén), calcula los importes y suma lo recibido a la orden en la misma
    // transacción, así que ya no se actualiza la orden línea por línea.
    const newPurchase = buildProcessOrderPayload({
      documentCode,
      date,
      providerId: idProvider,
      cai,
      invoiceNumber,
      typeFp,
      dateOut,
      paymentTypeId,
      freight,
      otherCharges,
      purchaseOrderId,
      requestedBy,
      description,
      providerType
    }, dataProducts);

    setSendForm(false);
    setLoading(true);
    request.POST('inventory/process/purchases', newPurchase, (resp) => {
      const saved = resp.data;
      onInputChange({ target: { name: 'documentId', value: saved.documentId } });
      fnGetDocuments(purchaseOrderId);
      fnViewOrderDetail(purchaseOrderId);
      setOpen(false);
      if (validInt(workOrderId) > 0) {
        // guardar detalle de orden de trabajo si existe
        const detailWorkOrder = {
          fatherId: workOrderId,
          providerId: idProvider,
          documentId: saved.documentId,
          documentCode,
          date,
          subtotal: subTotal,
          discount,
          valGrav: valueTaxable,
          valExent: valueExempt,
          valTax: tax,
          valOthers: otherCharges + freight,
          total
        }
        request.POST('accounting/process/workOrderDetail', detailWorkOrder, () => {
          setLoading(false)
        }, () => {
          setLoading(false);
        }, false);
      } else {
        setLoading(false);
      }
    }, () => {
      setLoading(false);
    });
  }

  const fnConcepts = () => { }

  useEffect(() => {
    const newDetail = orderDetail.map((item) => {
      const subtotal = validFloat(item.qtyRec) * validFloat(item.price);
      const discountProd = subtotal * (validFloat(item.percentDiscount) / 100);
      const taxProd = (subtotal - discountProd) * (validFloat(item.percentTax) / 100);
      const taxedValue = validFloat(item.tax) > 0 ? subtotal : 0;
      const exemptValue = validFloat(item.tax) === 0 ? subtotal : 0;
      const totalProd = subtotal - discountProd + taxProd;
      return {
        id: item.id,
        productCode: item.productCode,
        qty: validFloat(item.qty),
        qtyRec: validFloat(item.qtyRec),
        qtyReceived: validFloat(item.qtyReceived),
        price: validFloat(item.price),
        subTotal: subtotal,
        discountPercent: validFloat(item.percentDiscount),
        taxPercent: validFloat(item.percentTax),
        discount: discountProd,
        valueExempt: exemptValue,
        valueTaxable: taxedValue,
        tax: taxProd,
        total: totalProd,
        // Legacy: la columna tax_type del detalle de la compra es el "Exonerado" de la orden, no el valueExempto.
        isExonerated: !!item.isExonerated
      }
    });
    const sumSubtotal = newDetail.map(item => validFloat(item.subTotal)).reduce((prev, curr) => prev + curr, 0);
    const sumDiscount = newDetail.map(item => validFloat(item.discount)).reduce((prev, curr) => prev + curr, 0);
    const sumExent = newDetail.map(item => validFloat(item.valueExempt)).reduce((prev, curr) => prev + curr, 0);
    const sumGravado = newDetail.map(item => validFloat(item.valueTaxable)).reduce((prev, curr) => prev + curr, 0);
    const sumTaxes = newDetail.map(item => validFloat(item.tax)).reduce((prev, curr) => prev + curr, 0);
    const sumTotal = newDetail.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);

    const newValues = {
      subTotal: sumSubtotal,
      valueExempt: sumExent,
      valueTaxable: sumGravado,
      discount: sumDiscount,
      tax: sumTaxes,
      total: sumTotal + validFloat(freight) + validFloat(otherCharges)
    }

    if (validInt(workOrderId) > 0) {
      const filterWorkOrder = listWorkOrders.filter((item) => {
        return item.value === validInt(workOrderId);
      });
      newValues.expenseCtaCode = filterWorkOrder[0].idCtaCont;
    }

    setDataProducts(newDetail);
    setBulkForm(newValues);
  }, [orderDetail]);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" sm="7">
            <Row>
              <Colxx xxs="12">
                <SearchSelect
                  label='page.purchaseOrders.modal.process.select.documentId'
                  name="documentCode"
                  inputValue={documentCode}
                  options={listTypeDocument}
                  onChange={onInputChange}
                  invalid={sendForm && !!documentCodeValid}
                  feedbackText={sendForm && (documentCodeValid || null)}
                />
              </Colxx>
              <Colxx xxs="12">
                <SearchSelect
                  label='page.purchaseOrders.modal.process.select.providerId'
                  name="idProvider"
                  inputValue={idProvider}
                  options={listProviders}
                  onChange={onInputChange}
                  invalid={sendForm && !!idProviderValid}
                  feedbackText={sendForm && (idProviderValid || null)}
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="cai"
                  label='page.purchaseOrders.modal.process.input.cai'
                  value={cai}
                  onChange={onInputChange}
                  type="text"
                  mask="******-******-******-******-******-**"
                  maskChar=" "
                  // tag={ReactInputMask}
                  invalid={sendForm && !!caiValid}
                  feedbackText={sendForm && (caiValid || null)}
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="invoiceNumber"
                  label='page.purchaseOrders.modal.process.input.numCai'
                  value={invoiceNumber}
                  onChange={onInputChange}
                  type="text"
                  mask="***-***-**-********"
                  maskChar=" "
                  // tag={ReactInputMask}
                  invalid={sendForm && !!invoiceNumberValid}
                  feedbackText={sendForm && (invoiceNumberValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" md="6">
                <DateCalendar
                  name="date"
                  label="page.purchaseOrders.modal.process.input.date"
                  value={date}
                  onChange={onInputChange}
                  invalid={sendForm && !!dateValid}
                  feedbackText={sendForm && (dateValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" md="6">
                <DateCalendar
                  name="dateOut"
                  label="page.purchaseOrders.modal.process.input.dateOut"
                  value={dateOut}
                  onChange={onInputChange}
                  invalid={sendForm && !!dateOutValid}
                  feedbackText={sendForm && (dateOutValid || null)}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <SearchSelect
                  label='page.purchaseOrders.modal.process.input.noCtaExpense'
                  name="expenseCtaCode"
                  inputValue={expenseCtaCode}
                  options={listLedgerAccounts}
                  onChange={onInputChange}
                  invalid={sendForm && !!expenseCtaCodeValid}
                  feedbackText={sendForm && (expenseCtaCodeValid || null)}
                />
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs="12" sm="5">
            <Row>
              <Colxx xxs="12" xs="6">
                <InputField
                  name="valueExempt"
                  label='page.purchaseOrders.input.valueExempt'
                  value={valueExempt}
                  onChange={onInputChange}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" xs="6">
                <InputField
                  name="valueTaxable"
                  label='page.purchaseOrders.input.valueTaxed'
                  value={valueTaxable}
                  onChange={onInputChange}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" xs="6">
                <InputField
                  name="valueExonerated"
                  label='page.purchaseOrders.input.valueExonerated'
                  value={valueExonerated}
                  onChange={onInputChange}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" xs="6">
                <InputField
                  name="discount"
                  label='page.purchaseOrders.input.valueDiscount'
                  value={discount}
                  onChange={onInputChange}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" xs="6">
                <InputField
                  name="tax"
                  label='page.purchaseOrders.input.tax'
                  value={tax}
                  onChange={onInputChange}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" xs="6">
                <InputField
                  name="otherCharges"
                  label='page.purchaseOrders.input.valueOthers'
                  value={otherCharges}
                  onChange={onOtherChargesChange}
                  type="text"
                />
              </Colxx>
              <Colxx xxs="12" xs="6">
                <InputField
                  name="freight"
                  label='page.purchaseOrders.modal.process.input.freight'
                  value={freight}
                  onChange={onFreightChange}
                  type="text"
                />
              </Colxx>
              <Colxx xxs="12" xs="6">
                <InputField
                  name="total"
                  label='page.purchaseOrders.input.valueTotal'
                  value={total}
                  onChange={onInputChange}
                  type="text"
                  disabled
                  invalid={sendForm && !!totalValid}
                  feedbackText={sendForm && (totalValid || null)}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <RadioGroup
                  label="page.purchaseOrders.modal.process.radio.typePurchase"
                  name="typeFp"
                  value={typeFp}
                  onChange={onInputChange}
                  options={[
                    { id: 1, label: 'page.purchaseOrders.modal.process.radio.cash' },
                    { id: 2, label: 'page.purchaseOrders.modal.process.radio.credit' }
                  ]}
                  display='flex'
                  invalid={sendForm && !!typeFpValid}
                  feedbackText={sendForm && (typeFpValid || null)}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <Button color="info" onClick={fnConcepts}>
                  <i className="iconsminds-book" />{IntlMessages("button.concepts")}
                </Button>
              </Colxx>
            </Row>
          </Colxx>
        </Row>
        <Row className='mt-3'>
          <Colxx xxs="12">
            <ReactTableEdit {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveProcessOrder}>
          <i className="iconsminds-save" /> {IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalProcessOrder