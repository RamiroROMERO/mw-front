import { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import ModalViewPurchases from './ModalViewPurchases';
import FormPurchase from './FormPurchase';
import DetailProduct from './DetailProduct';
import DetailTable from './DetailTable';
import Totals from './Totals';
import { usePurchases } from './usePurchases';
import { usePurchaseDeta } from './usePurchaseDeta';
import ModalViewOrders from '../purchaseOrders/ModalViewOrders';
import ModalApplyInventory from './ModalApplyInventory';
import ModalExonerated from './ModalExonerated';
import ModalImportation from './ModalImportation';
import ModalComplementaryInvoices from './ModalComplementaryInvoices';

const Purchases = (props) => {
  const { setLoading } = props;
  const [purchaseDetail, setPurchaseDetail] = useState([]);

  const { formStateDeta, formValidationDeta, isFormValidDeta, onInputChangeDeta, onResetFormDeta, setBulkFormDeta, openModalProducts, fnGetDataDetail, setOpenModalProducts, dataProducts, fnViewProducts, fnSelectProduct } = usePurchaseDeta({ setLoading, setPurchaseDetail })

  const { listDocuments, listPaymentTypes, listProviders, listStores, propsToControlPanel, openModalPurchases, setOpenModalPurchases, openMsgCancelPurchase, setOpenMsgCancelPurchase, fnOkCancelPurchase, sendForm, formState, formValidation, onInputChange, setBulkForm, dataPurchases, sendFormDeta, setSendFormDeta, dataOrders, openModalViewOrders, setOpenModalViewOrders, fnViewOrder, openModalApplyInventory, setOpenModalApplyInventory, applyInventoryRows, fnUpdateApplyInventoryRow, fnConfirmApplyInventory, openMsgAccountDocument, setOpenMsgAccountDocument, fnOkAccountDocument, openModalExonerated, setOpenModalExonerated, openModalImportation, setOpenModalImportation, propsToComplementary } = usePurchases({ setLoading, onResetFormDeta, purchaseDetail, setPurchaseDetail })

  const { id, documentCode, storeId, providerId, paymentTypeId, cai, numCai, date, dateOut, nameRequire, orderId,
    typeDocto, valueSubtotal, valueDiscount, exent, exonera, gravado, valueTax, freight, otherCharges, valueTotal, bonification,
    exemptedCertificate, exemptedNumber, exemptedRecord, importNumberDua, importTicket, importCif, importDai, importSelect } = formState;

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
      dataProducts,
      // ModalViewProd espera `fnSelectItem` (ver src/views/app/settings/productsCatalog/
      // ModalViewProd.jsx) — faltaba, así que el botón "ver" del catálogo nunca
      // seleccionaba nada: agregar productos a la compra estaba roto siempre.
      fnSelectItem: fnSelectProduct
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

  const propsToModalApplyInventory = {
    ModalContent: ModalApplyInventory,
    title: "page.purchases.modal.applyInventory.title",
    open: openModalApplyInventory,
    setOpen: setOpenModalApplyInventory,
    maxWidth: 'xl',
    data: {
      applyInventoryRows,
      fnUpdateApplyInventoryRow,
      fnConfirmApplyInventory
    }
  }

  const propsToModalExonerated = {
    ModalContent: ModalExonerated,
    title: "page.purchases.modal.exonerated.title",
    open: openModalExonerated,
    setOpen: setOpenModalExonerated,
    maxWidth: 'lg',
    data: {
      exemptedCertificate,
      exemptedNumber,
      exemptedRecord,
      onInputChange
    }
  }

  const propsToModalImportation = {
    ModalContent: ModalImportation,
    title: "page.purchases.modal.importation.title",
    open: openModalImportation,
    setOpen: setOpenModalImportation,
    maxWidth: 'lg',
    data: {
      importNumberDua,
      importTicket,
      importCif,
      importDai,
      importSelect,
      onInputChange
    }
  }

  const propsToModalComplementary = {
    ModalContent: ModalComplementaryInvoices,
    title: "page.purchases.modal.complementary.title",
    open: propsToComplementary.openModalComplementary,
    setOpen: propsToComplementary.setOpenModalComplementary,
    maxWidth: 'xl',
    data: propsToComplementary
  }

  const propsToMsgCancelPurchase = {
    open: openMsgCancelPurchase,
    setOpen: setOpenMsgCancelPurchase,
    fnOnOk: fnOkCancelPurchase,
    title: "msg.question.cancel.document.title"
  }

  const propsToMsgAccountDocument = {
    open: openMsgAccountDocument,
    setOpen: setOpenMsgAccountDocument,
    fnOnOk: fnOkAccountDocument,
    title: "msg.question.accountDocument.title"
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
      <Modal {...propsToModalApplyInventory} />
      <Modal {...propsToModalExonerated} />
      <Modal {...propsToModalImportation} />
      <Modal {...propsToModalComplementary} />
      <Confirmation {...propsToMsgCancelPurchase} />
      <Confirmation {...propsToMsgAccountDocument} />
    </>
  );
}
export default Purchases;