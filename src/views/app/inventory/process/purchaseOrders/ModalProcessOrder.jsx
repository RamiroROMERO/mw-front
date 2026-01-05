import React, { useEffect, useState } from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { RadioGroup } from '@/components/radioGroup'
import { ReactTableEdit } from "@/components/reactTableEdit";
import { IntlMessages, validFloat, validInt } from '@/helpers/Utils'
import { useForm } from '@/hooks'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
// import ReactInputMask from 'react-input-mask';
import DateCalendar from '@/components/dateCalendar'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { request } from '@/helpers/core';

const ModalProcessOrder = ({ data, setOpen }) => {
  const { orderId, providerId, paymentTypeId, nameRequire, description, listTypeDocument, listProviders, listLedgerAccounts,
    orderDetail, setOrderDetail, setLoading, workOrderId, listWorkOrders, valueOthers, fnGetDocuments, fnViewOrderDetail } = data;
  const [dataProducts, setDataProducts] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const filterProv = listProviders.filter((item) => {
    return item.value === validInt(providerId);
  });

  const purchaseOrdersValid = {
    documentCode: [(val) => val !== "", "msg.required.input.codeProduct"],
    cai: [(val) => val !== "", "msg.required.input.numInvoice"],
    numCai: [(val) => val !== "", "msg.required.input.numInvoice"],
    date: [(val) => val !== "", "msg.required.input.date"],
    dateOut: [(val) => val !== "", "msg.required.input.date"],
    idProvider: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    typeDocto: [(val) => validInt(val) > 0, "msg.required.select.typePurchase"],
    total: [(val) => validInt(val) > 0, "msg.required.input.totalOrderProcess"],
    noCtaExpense: [(val) => val !== "", "msg.required.select.noCtaExpense"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    documentCode: "",
    documentId: 0,
    idProvider: providerId,
    cai: filterProv[0].cai !== '' ? filterProv[0].cai : '',
    numCai: '',
    providerType: filterProv[0].providerType ? filterProv[0].providerType : 0,
    date: '',
    dateOut: '',
    noCtaExpense: '',
    subTotal: 0,
    exent: 0,
    gravado: 0,
    exonera: 0,
    discount: 0,
    tax: 0,
    otherCharges: validFloat(valueOthers),
    freight: 0,
    total: 0,
    typeDocto: 0,
  }, purchaseOrdersValid);

  const { id, documentCode, documentId, idProvider, providerType, cai, numCai, date, dateOut, noCtaExpense, subTotal, exent, gravado, exonera,
    discount, tax, otherCharges, freight, total, typeDocto } = formState;

  const { documentCodeValid, caiValid, numCaiValid, dateValid, dateOutValid, idProviderValid, typeDoctoValid, totalValid,
    noCtaExpenseValid } = formValidation;

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
        label: "page.purchaseOrders.modal.process.table.qtyReceibed", field: "qtyRec", isEditable: true,
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

    const newPurchase = {
      documentCode,
      documentId,
      date,
      providerId: idProvider,
      cai,
      numCai,
      subtotal: subTotal,
      discount,
      exent,
      gravado,
      tax,
      freight,
      otherCharges,
      total,
      typeDocto,
      dateOut,
      paymentTypeId,
      noCtaExpense,
      orderId,
      nameRequire,
      description,
      providerType
    }
    // Generar documento
    setLoading(true);
    request.POST('admin/documents/getCurrentNumber', { code: documentCode }, (resp4) => {
      newPurchase.documentId = resp4.data.codeInt;
      onInputChange({ target: { name: 'documentId', value: resp4.data.codeInt } });
      setSendForm(false);
      setLoading(true);
      request.POST('inventory/process/purchases', newPurchase, (resp) => {
        // guardar detalle de la compra
        dataProducts.forEach(item => {
          if (item.qtyRec > 0) {
            const detailPurchase = {
              date,
              purchaseId: resp.data.id,
              productCode: item.productCode,
              qty: validFloat(item.qty),
              price: validFloat(item.price),
              subtotal: validFloat(item.subTotal),
              discountPercent: validFloat(item.discountPercent),
              discount: validFloat(item.discount),
              taxPercent: validFloat(item.taxPercent),
              tax: validFloat(item.tax),
              total: validFloat(item.total),
              isTaxFree: item.isTaxFree,
              dateOut
            }
            setLoading(true);
            request.POST('inventory/process/purchaseDetail', detailPurchase, (resp2) => {
              fnGetDocuments(orderId);
              setLoading(false);
            }, (err) => {

              setLoading(false);
            }, false);
            setLoading(true);
            // actualizar las cantidades en el detalle de la orden de compra
            const updateOrder = {
              qtyReceibed: item.qtyRec + item.qtyReceibed,
              qtyMissing: item.qty - (item.qtyReceibed + item.qtyRec)
            }
            setLoading(true);
            request.PUT(`inventory/process/purchaseOrderDetail/${item.id}`, updateOrder, (resp5) => {
              fnViewOrderDetail(orderId);
              setLoading(false);
            }, (err) => {

              setLoading(false);
            });
          }
          setOpen(false);
        });
        if (validInt(workOrderId) > 0) {
          // guardar detalle de orden de trabajo si existe
          const detailWorkOrder = {
            fatherId: workOrderId,
            providerId: idProvider,
            documentId: resp4.data.codeInt,
            documentCode,
            date,
            subtotal: subTotal,
            discount,
            valGrav: gravado,
            valExent: exent,
            valTax: tax,
            valOthers: otherCharges + freight,
            total
          }
          request.POST('accounting/process/workOrderDetail', detailWorkOrder, (resp3) => {
            setLoading(false)
          }, (err) => {

            setLoading(false);
          }, false);
        }
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }, (err) => {

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
        qtyReceibed: validFloat(item.qtyReceibed),
        price: validFloat(item.price),
        subTotal: subtotal,
        discountPercent: validFloat(item.percentDiscount),
        taxPercent: validFloat(item.percentTax),
        discount: discountProd,
        exent: exemptValue,
        gravado: taxedValue,
        tax: taxProd,
        total: totalProd,
        isTaxFree: validFloat(item.tax) === 0 ? 1 : 0
      }
    });
    const sumSubtotal = newDetail.map(item => validFloat(item.subTotal)).reduce((prev, curr) => prev + curr, 0);
    const sumDiscount = newDetail.map(item => validFloat(item.discount)).reduce((prev, curr) => prev + curr, 0);
    const sumExent = newDetail.map(item => validFloat(item.exent)).reduce((prev, curr) => prev + curr, 0);
    const sumGravado = newDetail.map(item => validFloat(item.gravado)).reduce((prev, curr) => prev + curr, 0);
    const sumTaxes = newDetail.map(item => validFloat(item.tax)).reduce((prev, curr) => prev + curr, 0);
    const sumTotal = newDetail.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);

    const newValues = {
      subTotal: sumSubtotal,
      exent: sumExent,
      gravado: sumGravado,
      discount: sumDiscount,
      tax: sumTaxes,
      total: sumTotal + validFloat(freight) + validFloat(otherCharges)
    }

    if (validInt(workOrderId) > 0) {
      const filterWorkOrder = listWorkOrders.filter((item) => {
        return item.value === validInt(workOrderId);
      });
      newValues.noCtaExpense = filterWorkOrder[0].idCtaCont;
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
                  name="numCai"
                  label='page.purchaseOrders.modal.process.input.numCai'
                  value={numCai}
                  onChange={onInputChange}
                  type="text"
                  mask="***-***-**-********"
                  maskChar=" "
                  // tag={ReactInputMask}
                  invalid={sendForm && !!numCaiValid}
                  feedbackText={sendForm && (numCaiValid || null)}
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
                  name="noCtaExpense"
                  inputValue={noCtaExpense}
                  options={listLedgerAccounts}
                  onChange={onInputChange}
                  invalid={sendForm && !!noCtaExpenseValid}
                  feedbackText={sendForm && (noCtaExpenseValid || null)}
                />
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs="12" sm="5">
            <Row>
              <Colxx xxs="12" xs="6">
                <InputField
                  name="exent"
                  label='page.purchaseOrders.input.valueExcent'
                  value={exent}
                  onChange={onInputChange}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" xs="6">
                <InputField
                  name="gravado"
                  label='page.purchaseOrders.input.valueTaxed'
                  value={gravado}
                  onChange={onInputChange}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" xs="6">
                <InputField
                  name="exonera"
                  label='page.purchaseOrders.input.valueExonerated'
                  value={exonera}
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
                  name="typeDocto"
                  value={typeDocto}
                  onChange={onInputChange}
                  options={[
                    { id: 1, label: 'page.purchaseOrders.modal.process.radio.cash' },
                    { id: 2, label: 'page.purchaseOrders.modal.process.radio.credit' }
                  ]}
                  display='flex'
                  invalid={sendForm && !!typeDoctoValid}
                  feedbackText={sendForm && (typeDoctoValid || null)}
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