import React, { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import Confirmation from '@/containers/ui/confirmationMsg';
import Modal from "@/components/modal";
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import ModalViewPurchases from './ModalViewPurchases';
import FormPurchase from './FormPurchase';
import DetailProduct from './DetailProduct';
import DetailTable from './DetailTable';
import Totals from './Totals';
import { usePurchases } from './usePurchases';
import { usePurchaseDeta } from './usePurchaseDeta';
import ModalViewOrders from '../purchaseOrders/ModalViewOrders';

const Purchases = (props) => {
  const { setLoading } = props;
  const [purchaseDetail, setPurchaseDetail] = useState([]);

  const { formStateDeta, formValidationDeta, isFormValidDeta, onInputChangeDeta, onResetFormDeta, setBulkFormDeta, openModalProducts, fnGetDataDetail, setOpenModalProducts, dataProducts, fnViewProducts } = usePurchaseDeta({ setLoading, setPurchaseDetail })

  const { listDocuments, listPaymentTypes, listProviders, listStores, propsToControlPanel, openModalPurchases, setOpenModalPurchases, openMsgCancelPurchase, setOpenMsgCancelPurchase, fnOkCancelPurchase, sendForm, formState, formValidation, onInputChange, setBulkForm, dataPurchases, sendFormDeta, setSendFormDeta, dataOrders, openModalViewOrders, setOpenModalViewOrders, fnViewOrder } = usePurchases({ setLoading, onResetFormDeta, purchaseDetail, setPurchaseDetail })

  const { id, documentCode, storeId, providerId, paymentTypeId, cai, numCai, date, dateOut, nameRequire, orderId,
    typeDocto, valueSubtotal, valueDiscount, exent, exonera, gravado, valueTax, freight, otherCharges, valueTotal, bonification } = formState;

  const { idProd, productCode, nameProduct, qty, price, subTotal, discountPercent, discount, taxPercent, tax, total, nameUM, lotCode,
    dateOut: dateOutProd, isTaxFree, isBonus, previousCost, currentExistence } = formStateDeta;

  const propsToFormPurchase = {
    documentCode,
    storeId,
    providerId,
    paymentTypeId,
    cai,
    numCai,
    date,
    dateOut,
    nameRequire,
    orderId,
    typeDocto,
    listDocuments,
    listStores,
    listProviders,
    listPaymentTypes,
    onInputChange,
    setBulkForm,
    formValidation,
    sendForm
  }

  const propsToDetailProduct = {
    idProd,
    productCode,
    nameProduct,
    qty,
    price,
    subTotal,
    discountPercent,
    discount,
    taxPercent,
    tax,
    total,
    nameUM,
    lotCode,
    dateOutProd,
    isTaxFree,
    isBonus,
    previousCost,
    currentExistence,
    storeId,
    onInputChangeDeta,
    fnViewProducts,
    setBulkFormDeta,
    purchaseDetail,
    setPurchaseDetail,
    setBulkForm,
    formValidationDeta,
    isFormValidDeta,
    sendFormDeta,
    setSendFormDeta
  }

  const propsToTotals = {
    valueSubtotal,
    valueDiscount,
    exent,
    exonera,
    gravado,
    valueTax,
    freight,
    otherCharges,
    valueTotal,
    bonification
  }

  const propsToDetailTable = {
    purchaseDetail,
    setPurchaseDetail,
    setBulkForm,
    setBulkFormDeta
  }

  const propsToModalViewProd = {
    ModalContent: ModalViewProd,
    title: "page.productsCatalog.modal.viewProduct.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
      dataProducts
    }
  }

  const propsToModalPurchases = {
    ModalContent: ModalViewPurchases,
    title: "page.purchases.modal.viewPurchases.title",
    open: openModalPurchases,
    setOpen: setOpenModalPurchases,
    maxWidth: 'lg',
    data: {
      dataPurchases,
      setBulkForm,
      fnGetDataDetail
    }
  }

  const propsToModalViewOrders = {
    ModalContent: ModalViewOrders,
    title: "page.purchaseOrders.modal.viewOrder.title",
    open: openModalViewOrders,
    setOpen: setOpenModalViewOrders,
    maxWidth: 'lg',
    data: {
      dataOrders,
      fnViewOrder
    }
  }

  const propsToMsgCancelPurchase = {
    open: openMsgCancelPurchase,
    setOpen: setOpenMsgCancelPurchase,
    fnOnOk: fnOkCancelPurchase,
    title: "msg.question.cancel.document.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <FormPurchase {...propsToFormPurchase} />
              <DetailProduct {...propsToDetailProduct} />
              <DetailTable {...propsToDetailTable} />
              <Totals {...propsToTotals} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProd} />
      <Modal {...propsToModalPurchases} />
      <Modal {...propsToModalViewOrders} />
      <Confirmation {...propsToMsgCancelPurchase} />
    </>
  );
}
export default Purchases;