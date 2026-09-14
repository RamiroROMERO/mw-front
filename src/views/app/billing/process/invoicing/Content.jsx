import { useEffect, useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { validFloat, formatNumber, validInt, IntlMessagesFn } from "@Helpers/Utils";
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks'
import ControlPanel from '@Components/controlPanel';
import TableButton from "@Components/tableButtons";
import notification from '@Containers/ui/Notifications';
import DateHelper from '@Helpers/DateHelper';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import ModalProducts from './ModalProducts';
import ModalInvoices from './ModalViewInvoi';
import ModalChangePrice from './ModalChangePrice';
import ModalPrintInvoice from './ModalPrintInvoice';
import ModalGenerateInvoice from './ModalGenerateInvoice';
import ModalQuotation from './ModalQuotation';
import ModalDeliveryDoc from './ModalDeliveryDoc';
import ModalVoidInvoice from '../pointSales/ModalVoidInvoice';
import ModalCreditStatus from './ModalCreditStatus';
import ModalEditCostDist from './ModalEditCostDist';
import ModalSeekPurchaseOrders from '../purchaseOrders/ModalSeekPurchaseOrders';
import ModalChangeProduct from './ModalChangeProduct';
import ModalEditInvoiceInfo from './ModalEditInvoiceInfo';
import ModalSendEmail from './ModalSendEmail';
import InvoicingForm from './InvoicingForm';
import InvoicingDetail from './InvoicingDetail';
import InvoicingTable from './InvoicingTableProd';
import ViewPdf from '@Components/ViewPDF/ViewPdf';

const Invoicing = (props) => {
  const { setLoading, voidControl, editInfoControl, changeProductControl } = props;
  const [listTypeDocuments, setListTypeDocuments] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [listAreas, setListAreas] = useState([]);
  const [listWarehouse, setListWarehouse] = useState([]);
  const [listSellers, setListSellers] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [invoiceDetail, setInvoiceDetail] = useState([]);
  const [dataInvoicing, setDataInvoicing] = useState([]);
  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [openModalInvoices, setOpenModalInvoices] = useState(false);
  const [openModalPrice, setOpenModalPrice] = useState(false);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [openModalGenerate, setOpenModalGenerate] = useState(false);
  const [openModalQuotation, setOpenModalQuotation] = useState(false);
  const [openModalDeliveryDoc, setOpenModalDeliveryDoc] = useState(false);
  const [openMsgCancelInvoice, setOpenMsgCancelInvoice] = useState(false);
  const [openModalVoidInvoice, setOpenModalVoidInvoice] = useState(false);
  const [openMsgGenerateInvoice, setOpenMsgGenerateInvoice] = useState(false);
  const [sendFormIndex, setSendFormIndex] = useState(false);
  const [sendFormDetail, setSendFormDetail] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [idProd, setIdProd] = useState(0);
  const [hasSellerControl, setHasSellerControl] = useState(false);
  const [hasDateOutControl, setHasDateOutControl] = useState(false);
  const [hasStoreControl, setHasStoreControl] = useState(false);
  const [hasStockControl, setHasStockControl] = useState(false);
  const [creditLimit, setCreditLimit] = useState(0);
  const [creditCurrent, setCreditCurrent] = useState(0);
  const [openModalCreditStatus, setOpenModalCreditStatus] = useState(false);
  const [openModalEditCostDist, setOpenModalEditCostDist] = useState(false);
  const [openModalSeekPurchaseOrders, setOpenModalSeekPurchaseOrders] = useState(false);
  const [dataSeekPurchaseOrders, setDataSeekPurchaseOrders] = useState([]);
  const [dateFormat, setDateFormat] = useState('DMY');
  const [openModalProforma, setOpenModalProforma] = useState(false);
  const [documentPathProforma, setDocumentPathProforma] = useState('');
  const [openModalChangeProduct, setOpenModalChangeProduct] = useState(false);
  const [selectedChangeLine, setSelectedChangeLine] = useState(null);
  const [openModalEditInfo, setOpenModalEditInfo] = useState(false);
  const [openSendEmail, setOpenSendEmail] = useState(false);

  const [recordSelected, setRecordSelected] = useState({});

  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const invoicingValid = {
    documentCode: [(val) => val !== "0" && val !== "", "msg.required.select.typeDocument"],
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    documentType: [(val) => validInt(val) > 0, "msg.required.select.salesType"],
    currency: [(val) => validInt(val) > 0, "msg.required.select.currency"]
  }

  const invoiceDetailValid = {
    productCode: [(val) => val !== "", "msg.required.input.codeProduct"],
    qty: [(val) => validInt(val) > 0, "msg.required.input.qty"],
    price: [(val) => validInt(val) > 0, "msg.required.input.price"],
  }

  const { formState: formIndex, formValidation: formValidationIndex, isFormValid: isFormValidIndex, onInputChange: onInputChangeIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex } = useForm({
    id: 0,
    customerId: 0,
    customerDNI: '',
    customerName: '',
    notes: '',
    documentCode: '',
    documentType: 1,
    currency: 1,
    date: DateHelper.format(new Date()),
    dateInProcess: DateHelper.format(new Date()),
    cashierId: 0,
    documentExo: false,
    documentId: 0,
    numcai: '',
    subTotalValue: 0,
    discountValue: 0,
    subTotExeValue: 0,
    subTotExoValue: 0,
    subtotTaxValue: 0,
    taxValue: 0,
    total: 0
  }, invoicingValid);

  const { formState: formDetail, formValidation: formValidationDetail, isFormValid: isFormValidDetail, onInputChange: onInputDetaChange, onResetForm: onResetFormDetail, setBulkForm: setBulkFormDetail } = useForm({
    productCode: '',
    description: '',
    areaId: 0,
    storeId: 0,
    unitProd: '',
    qty: 0,
    price: 0,
    subtotal: 0,
    discountPercent: 0,
    discountValue: 0,
    taxPercent: 0,
    taxValue: 0,
    total: 0,
    typePrice: 2,
    priceLocalMin: 0,
    priceLocalMid: 0,
    priceLocalMax: 0,
    otherPriceProd: 0,
    unitedCoste: 0,
    unitedOut: 0,
    qtyDist: 0,
    haveComiss: 0,
    lotCode: '',
    dateOut: '',
    productType: 0,
    existQty: 0
  }, invoiceDetailValid);

  const { productCode, description, unitProd, qty, price, subtotal, discountPercent, discountValue, taxPercent, taxValue,
    total: totalProd, typePrice, priceLocalMin, priceLocalMid, priceLocalMax, otherPriceProd, unitedCoste, unitedOut, qtyDist,
    haveComiss, areaId, storeId, lotCode, dateOut, productType, existQty } = formDetail;

  const { id, customerId, customerDNI, customerName, notes, documentCode, documentType, currency, date, dateInProcess, cashierId,
    documentExo, documentId, numcai, subTotalValue, discountValue: discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValue:
    taxValueInvoice, total } = formIndex;

  // Documento Fiscal ya fue Generado (CAI asignado) — igual que el legacy
  // (fac_facturacion.sc2: si Textbox_hw48/documentId != 0, bloquea modificar el
  // documento): ya no se puede editar la cabecera ni el detalle, solo consultar/imprimir.
  const isInvoiceSaved = validInt(documentId) > 0;

  // Estado del crédito del cliente (fac_pos_credit_status.sc2): "Crédito Actual" es la
  // suma de CxC pendientes del cliente (sin contar la venta en proceso, que todavía no
  // se ha generado). Solo aplica a ventas a Crédito, igual que el legacy
  // (Optiongroup_hw1.InteractiveChange retorna de inmediato si el valor es Contado).
  let creditStatusLevel = null;
  if (validInt(documentType) === 2 && validInt(customerId) > 0) {
    const creditRest = validFloat(creditLimit) - validFloat(creditCurrent);
    if (creditRest <= 0) {
      creditStatusLevel = 'over';
    } else if (validFloat(creditLimit) > 0 && (validFloat(creditCurrent) / validFloat(creditLimit)) * 100 > 80) {
      creditStatusLevel = 'warning';
    } else {
      creditStatusLevel = 'ok';
    }
  }

  const fnViewCreditStatus = () => {
    setOpenModalCreditStatus(true);
  }

  const handleAreaChange = e => {
    let valueStore = "0";
    let typePricelocal = 2;
    if (validInt(e.target.value) > 0) {
      const dataArea = listAreas.find((item) => {
        return validInt(item.id) === validInt(e.target.value);
      });
      valueStore = dataArea && dataArea.invStore !== null ? dataArea.invStore?.id : "0";
      typePricelocal = dataArea?.localPriceType;
    } else {
      valueStore = "0";
      typePricelocal = 2;
    }
    const newArea = {
      areaId: e.target.value,
      storeId: valueStore,
      typePrice: typePricelocal
    }
    setBulkFormDetail(newArea);
  }

  const handleQtyChange = e => {
    const subtotal1 = validFloat(e.target.value * price);
    const discount2 = validFloat((discountPercent * subtotal1) / 100);
    const tax1 = validFloat((taxPercent * (subtotal1 - discount2)) / 100);
    const total1 = validFloat((subtotal1 - discount2) + tax1);
    const newQty = {
      subtotal: subtotal1,
      discountValue: discount2,
      taxValue: tax1,
      total: total1,
      qty: e.target.value
    }
    setBulkFormDetail(newQty);
  }

  const handlePriceChange = e => {
    const subtotal2 = validFloat(e.target.value * qty);
    const discount3 = validFloat((discountPercent * subtotal2) / 100);
    const tax2 = validFloat((taxPercent * (subtotal2 - discount3)) / 100);
    const total2 = validFloat((subtotal2 - discount3) + tax2);
    const newPrice = {
      subtotal: subtotal2,
      discountValue: discount3,
      taxValue: tax2,
      total: total2,
      price: e.target.value
    }
    setBulkFormDetail(newPrice);
  }

  const handleDiscPercentChange = e => {
    const discount1 = validFloat((e.target.value * subtotal) / 100);
    const tax3 = validFloat((taxPercent * (subtotal - discount1)) / 100);
    const total3 = validFloat((subtotal - discount1) + tax3);
    const newDiscount = {
      taxValue: tax3,
      total: total3,
      discountValue: discount1,
      discountPercent: e.target.value
    }
    setBulkFormDetail(newDiscount);
  }

  const handleTaxPercentChange = e => {
    const tax = validFloat((e.target.value * (subtotal - discountValue)) / 100);
    const total4 = validFloat((subtotal - discountValue) + tax);
    const newTax = {
      total: total4,
      taxValue: tax,
      taxPercent: e.target.value
    }
    setBulkFormDetail(newTax);
  }

  const handleExemptChange = e => {
    const sumTaxes = invoiceDetail.map(item => validFloat(item.taxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTaxed = invoiceDetail.map(item => validFloat(item.subtotTaxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTotal = invoiceDetail.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);

    let valueExonerated = 0;
    let valueTaxed = 0;
    let valueTaxes = 0;
    let totalInvoice = 0;
    if (!e.target.checked === true || !e.target.checked === 1) {
      valueExonerated = sumTaxed;
      valueTaxed = 0;
      valueTaxes = 0;
      totalInvoice = sumTotal - sumTaxes
    } else {
      valueExonerated = 0;
      valueTaxed = sumTaxed;
      valueTaxes = sumTaxes;
      totalInvoice = sumTotal;
    }

    const addProduct = {
      subTotExoValue: valueExonerated,
      subtotTaxValue: valueTaxed,
      taxValue: valueTaxes,
      total: totalInvoice,
      documentExo: e.target.checked
    }
    setBulkFormIndex(addProduct);
  }

  const fnNewInvoicing = () => {
    setInvoiceDetail([]);
    onResetFormIndex();
    onResetFormDetail();
    setSendFormIndex(false);
    setSendFormDetail(false);
  }

  const fnViewInvoice = (item) => {
    onResetFormIndex();
    setRecordSelected(item);

    request.GET(buildUrl('billing/process/invoiceDetail', { idFather: item.id }), (resp) => {
      const invoiceProducts = resp.data.map((item2) => {
        return {
          id: item2.id,
          productCode: item2.productCode,
          description: item2.invProduct.name,
          qty: item2.qty,
          price: item2.price,
          subtotal: item2.subtotal,
          discountPercent: item2.discountPercent,
          taxPercent: item2.taxPercent,
          discountValue: item2.discountValue,
          subtotTaxValue: item2.taxValue > 0 ? item2.subtotal : 0,
          subTotExeValue: item2.taxValue === 0 ? item2.subtotal : 0,
          taxValue: item2.taxValue,
          total: item2.total,
          areaId: item2.areaId,
          storeId: item2.storeId,
          unitedCoste: item2.unitedCoste,
          typePrice: item2.typePrice,
          sellerCode: item2.sellerCode,
          qtyDist: item2.qtyDist,
          unitedOut: item2.unitedOut,
          haveComiss: item2.haveComiss,
          lotCode: item2.lotCode,
          dateOut: item2.dateOut
        }
      });
      setInvoiceDetail(invoiceProducts);
      setOpenModalInvoices(false);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSearchInvoicing = () => {
    setLoading(true);
    request.GET('billing/process/invoices?isPos=0', (resp) => {
      const invoices = resp.data.map((item) => {
        item.value = formatNumber(item.total);
        item.customerName = item.facCliente ? item.facCliente.nomcli : ''
        item.options = <TableButton color='primary' icon='eye' fnOnClick={() => fnViewInvoice(item)} />
        return item;
      });
      setDataInvoicing(invoices);
      setOpenModalInvoices(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSaveInvoicing = () => {
    setSendFormIndex(true);
    if (!isFormValidIndex) {
      return;
    }

    if (invoiceDetail.length === 0) {
      notification('warning', 'msg.required.select.product', 'alert.warning.title');
      return;
    }

    const newData = {
      documentCode,
      notes,
      date: date === '' ? DateHelper.format(new Date()) : date,
      customerId,
      subTotalValue,
      discountValue: discount,
      subtotTaxValue,
      subTotExeValue,
      subTotExoValue,
      taxValue: taxValueInvoice,
      total,
      isPos: 0,
      currency: validInt(currency),
      customerDNI,
      customerName,
      documentType: validInt(documentType),
      documentExo,
      cashierId
    }

    invoiceDetail.map((item) => {
      delete item.id;
      return item;
    });

    if (id && id > 0) {
      setLoading(true);
      request.PUT(`billing/process/invoices/${id}`, newData, (resp) => {
        setLoading(false);
        // Eliminar productos
        request.DELETE(buildUrl('billing/process/invoiceDetail', { idFather: id }), (resp2) => {
          // guardar productos
          const dataProducts = invoiceDetail.map((item) => {
            item.idFather = id;
            return item;
          });
          request.POST('billing/process/invoiceDetail/createMany', dataProducts, (resp3) => {
            setLoading(false);
          }, (err) => {

            setLoading(false);
          });
          setLoading(false);
        }, (err) => {

          setLoading(false);
        });
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('billing/process/invoices', newData, (resp) => {
        onInputChangeIndex({ target: { name: 'id', value: resp.data.id } });
        // guardar productos
        const dataProducts = invoiceDetail.map((item) => {
          item.idFather = resp.data.id;
          return item;
        });
        request.POST('billing/process/invoiceDetail/createMany', dataProducts, (resp2) => {
          setLoading(false);
        }, (err) => {

          setLoading(false);
        });
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  // Antes imprimía directo en formato Detallada; ahora abre ModalPrintInvoice para que
  // el usuario elija Detallada/Resumida por Tipo (ese modal existía pero no estaba
  // conectado a ningún botón).
  const fnPrintInvoicing = () => {
    if (id > 0) {
      setOpenModalPrint(true);
    }
  }

  // Documento sin CAI generado (borrador): nada se contabilizó todavía, un simple
  // marcado alcanza. Documento ya timbrado: hay que revertir kardex/partida/CxC, igual
  // que el POS (ver fnVoidInvoice más abajo).
  const fnCancelInvoicing = () => {
    if (id > 0 && documentId > 0) {
      setOpenModalVoidInvoice(true);
    } else if (id > 0) {
      setOpenMsgCancelInvoice(true);
    }
  }

  // Reversión transaccional (kardex, partida contable y CxC) — no un simple marcado de
  // isDeleted como antes: eso dejaba el stock descontado, la partida contable vigente y
  // la CxC cobrándole al cliente una factura anulada.
  const fnVoidInvoice = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`billing/process/invoices/void/${id}`, { reason }), () => {
      setOpenModalVoidInvoice(false);
      fnNewInvoicing();
      notification('success', 'msg.success.voidInvoice', 'alert.success.title');
      setLoading(false);
    }, (err) => {
      const errorCode = err?.messages?.[0]?.description?.name;
      if (errorCode === 'invoice.hasPayments') {
        notification('error', 'msg.error.voidInvoice.hasPayments', 'alert.error.title');
      } else {
        notification('error', 'msg.delete.record.error', 'alert.error.title');
      }
      setLoading(false);
    }, false);
  }

  const fnCancelInvoice = () => {
    const dataCancel = {
      isDeleted: 1
    }
    setLoading(true);
    request.PUT(`billing/process/invoices/${id}`, dataCancel, (resp) => {
      setOpenMsgCancelInvoice(false);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnQuotation = () => {
    if (id > 0) {
      setOpenModalQuotation(true);
    }
  }

  const fnInvoice = () => {
    if (id > 0 && documentId === 0) {
      setOpenMsgGenerateInvoice(true);
    } else if (documentId > 0) {
      notification('warning', 'msg.generateInvoice', 'alert.warning.title');
    }
  }

  const fnGenerateInvoice = () => {
    setOpenMsgGenerateInvoice(false);
    setOpenModalGenerate(true);
  }

  // Botón "Cargar Orden de Compra": solo aplica a un documento nuevo/sin guardar, igual
  // que el legacy (fac_facturacion.sc2:3960, Textbox_hw1.Value != 0 -> Return). Requiere
  // Área/Almacén ya seleccionados (y Vendedor si hasSellerControl está activo).
  const fnSearchPurchaseOrderToLoad = () => {
    if (id > 0) {
      return;
    }
    if (validInt(areaId) === 0 || validInt(storeId) === 0 || (hasSellerControl && validInt(cashierId) === 0)) {
      notification('warning', 'msg.required.areaStoreSeller', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET('billing/process/purchaseOrders', (resp) => {
      setDataSeekPurchaseOrders(resp.data);
      setOpenModalSeekPurchaseOrders(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  // Solo trae las líneas de productos de la Orden de Compra (se agregan al detalle
  // actual, sin reemplazarlo) — igual que el flujo activo del legacy, que NO copia
  // cliente/cabecera de la orden, solo sus productos.
  const fnLoadPurchaseOrder = (row) => {
    setOpenModalSeekPurchaseOrders(false);
    setLoading(true);
    request.GET(buildUrl('billing/process/purchaseOrderDetails', { idFather: row.id }), (resp) => {
      request.GET(buildUrl('inventory/process/stocks/getStocks', { storeId, enableForSale: 1 }), (resp2) => {
        const costByCode = new Map(resp2.data.map((item) => [item.productCode, validFloat(item.costValue)]));
        const sellerData = listSellers.find((item) => item.value === cashierId);

        const newLines = resp.data.map((item) => {
          const taxedValue = validFloat(item.taxValue) > 0 ? validFloat(item.subtotal) : 0;
          const exemptValue = validFloat(item.taxValue) === 0 ? validFloat(item.subtotal) : 0;
          return {
            id: new Date().getTime() + Math.random(),
            productCode: item.productCode,
            description: item.productData?.name || '',
            qty: validFloat(item.qty),
            price: validFloat(item.price),
            subtotal: validFloat(item.subtotal),
            discountPercent: validFloat(item.discountPercent),
            discountValue: validFloat(item.discountValue),
            subtotTaxValue: taxedValue,
            subTotExeValue: exemptValue,
            taxPercent: validFloat(item.taxPercent),
            taxValue: validFloat(item.taxValue),
            total: validFloat(item.total),
            areaId: validInt(areaId),
            storeId: validInt(storeId),
            unitedCoste: costByCode.get(item.productCode) || 0,
            typePrice: validInt(item.typePrice),
            sellerCode: sellerData ? sellerData.code : "",
            qtyDist: validFloat(item.qtyDist),
            unitedOut: item.undOutData?.name || '',
            haveComiss: 1
          }
        });

        const mergedDetail = [...invoiceDetail, ...newLines];
        setInvoiceDetail(mergedDetail);

        const sumSubtotal = mergedDetail.reduce((sum, item) => sum + validFloat(item.subtotal), 0);
        const sumDiscount = mergedDetail.reduce((sum, item) => sum + validFloat(item.discountValue), 0);
        const sumExempt = mergedDetail.reduce((sum, item) => sum + validFloat(item.subTotExeValue), 0);
        const sumTaxes = mergedDetail.reduce((sum, item) => sum + validFloat(item.taxValue), 0);
        const sumTaxed = mergedDetail.reduce((sum, item) => sum + validFloat(item.subtotTaxValue), 0);
        const sumTotal = mergedDetail.reduce((sum, item) => sum + validFloat(item.total), 0);

        const isExo = documentExo === true || documentExo === 1;
        setBulkFormIndex({
          subTotalValue: sumSubtotal,
          discountValue: sumDiscount,
          subTotExeValue: sumExempt,
          subTotExoValue: isExo ? sumTaxed : 0,
          subtotTaxValue: isExo ? 0 : sumTaxed,
          taxValue: isExo ? 0 : sumTaxes,
          total: isExo ? (sumTotal - sumTaxes) : sumTotal
        });
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }, (err) => {

      setLoading(false);
    });
  }

  const fnDeliver = () => {
    if (id > 0 && documentId > 0) {
      setOpenModalDeliveryDoc(true);
    } else if (documentId === 0) {
      notification('warning', 'msg.deliveryDoc', 'alert.warning.title');
    }
  }

  const fnEditCostDist = () => {
    if (id > 0) {
      setOpenModalEditCostDist(true);
    }
  }

  const fnEditInfo = () => {
    if (id > 0) {
      setOpenModalEditInfo(true);
    }
  }

  // Refleja en el formulario los campos que el modal de "Editar Información" acaba de
  // guardar — evita tener que recargar toda la factura desde el backend.
  const fnEditInfoSuccess = ({ customerDNI: newDNI, customerName: newName, notes: newNotes, documentType: newType, documentExo: newExo }) => {
    setBulkFormIndex({
      customerDNI: newDNI,
      customerName: newName,
      notes: newNotes,
      documentType: newType,
      documentExo: newExo
    });
  }

  const fnOpenSendEmail = () => {
    if (id === 0) {
      return;
    }
    setOpenSendEmail(true);
  }

  // Imprime la factura tal como está guardada, con formato simplificado (sin CAI/rango,
  // que normalmente todavía no existen en este punto) — igual que el legacy, que
  // permite (y espera) usar esto ANTES de generar el documento fiscal.
  const fnPrintProforma = () => {
    if (id === 0) {
      notification('warning', 'msg.required.saveDocument', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GETPdfUrl('billing/process/invoices/exportPDFProforma', { id, userName: userData.name }, (resp) => {
      setDocumentPathProforma(resp);
      setOpenModalProforma(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  // Solo aplica a una factura con documento fiscal ya generado — antes de eso no hay
  // kardex que corregir, el usuario simplemente edita/borra la línea directo.
  const fnOpenChangeProduct = (item) => {
    if (documentId === 0) {
      return;
    }
    setSelectedChangeLine(item);
    setOpenModalChangeProduct(true);
  }

  const fnChangeProductSuccess = (lineId, newProductCode, newProductName) => {
    setInvoiceDetail((current) => current.map((item) => (
      item.id === lineId ? { ...item, productCode: newProductCode, description: newProductName } : item
    )));
  }

  const fnSelectProduct = (item) => {
    onResetFormDetail();
    const newProduct = {
      productCode: item.productCode,
      description: item.name,
      unitProd: item.unitProd,
      taxPercent: validFloat(item.taxPercent),
      qty: 1,
      priceLocalMin: item.min,
      priceLocalMid: item.med,
      priceLocalMax: item.max,
      unitedCoste: item.costValue,
      unitedOut: item.outputUnit,
      qtyDist: item.qtyDist,
      haveComiss: item.paymentComiss,
      productType: validInt(item.typeId),
      existQty: validFloat(item.qtyStock)
    }
    if (validInt(typePrice) === 1) {
      newProduct.price = validFloat(item.min);
      newProduct.subtotal = validFloat(item.min);
    } else if (validInt(typePrice) === 2) {
      newProduct.price = validFloat(item.med);
      newProduct.subtotal = validFloat(item.med);
    } else if (validInt(typePrice) === 3) {
      newProduct.price = validFloat(item.max);
      newProduct.subtotal = validFloat(item.max);
    } else {
      newProduct.price = 0;
      newProduct.subtotal = 0;
    }
    newProduct.taxValue = newProduct.subtotal * (newProduct.taxPercent > 0 ? newProduct.taxPercent / 100 : 0);
    newProduct.total = newProduct.subtotal + newProduct.taxValue;
    setBulkFormDetail(newProduct);
    setOpenModalProducts(false);
  }

  const fnViewProducts = () => {
    setLoading(true);
    setListProducts([]);
    request.GET(buildUrl('inventory/process/stocks/getStocks', { storeId, enableForSale: 1 }), (resp) => {
      const products = resp.data.map((item) => {
        item.taxPercent = item.percentTax
        item.name = item.productName
        item.unitProd = item.undoutName
        item.min = item.localMinPrice
        item.med = item.localMedPrice
        item.max = item.localMaxPrice
        item.stock = formatNumber(item.qtyStock)
        item.options = <TableButton color='primary' icon='eye' fnOnClick={() => fnSelectProduct(item)} />
        return item;
      });
      setListProducts(products);
      setOpenModalProducts(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnAddProduct = () => {
    setSendFormDetail(true);
    if (!isFormValidDetail) {
      return;
    }

    if (hasSellerControl && validInt(cashierId) === 0) {
      notification('warning', 'msg.required.select.seller', 'alert.warning.title');
      return;
    }

    // Igual que el legacy (fac_facturacion.sc2:2941): solo bloquea si el almacén y la
    // empresa tienen control de existencia activos, y solo para productos físicos
    // (type=1) — servicios y materia prima no se validan.
    if (hasStoreControl && hasStockControl && validInt(productType) === 1 && validFloat(existQty) < validFloat(qty)) {
      notification('warning', 'msg.error.insufficientStock', 'alert.warning.title');
      return;
    }

    const taxedValue = taxValue > 0 ? subtotal : 0;
    const exemptValue = taxValue === 0 ? subtotal : 0;

    // Cambiar codigo de vendedor
    const filterSellers = listSellers.filter((item) => {
      return item.value === cashierId;
    });

    const detail = {
      id: new Date().getTime(),
      productCode,
      description,
      qty: validFloat(qty),
      price: validFloat(price),
      subtotal: validFloat(subtotal),
      discountPercent: validFloat(discountPercent),
      discountValue: validFloat(discountValue),
      subtotTaxValue: validFloat(taxedValue),
      subTotExeValue: validFloat(exemptValue),
      taxPercent: validFloat(taxPercent),
      taxValue: validFloat(taxValue),
      total: validFloat(totalProd),
      areaId: validInt(areaId),
      storeId: validInt(storeId),
      unitedCoste: validFloat(unitedCoste),
      typePrice: validInt(typePrice),
      sellerCode: filterSellers ? filterSellers.code : "",
      qtyDist: validFloat(qtyDist),
      unitedOut,
      haveComiss: validInt(haveComiss),
      lotCode,
      dateOut: dateOut || null
    }

    const sumSubtotal = invoiceDetail.map(item => validFloat(item.subtotal)).reduce((prev, curr) => prev + curr, 0);
    const sumDiscount = invoiceDetail.map(item => validFloat(item.discountValue)).reduce((prev, curr) => prev + curr, 0);
    const sumExempt = invoiceDetail.map(item => validFloat(item.subTotExeValue)).reduce((prev, curr) => prev + curr, 0);

    const sumTaxes = invoiceDetail.map(item => validFloat(item.taxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTaxed = invoiceDetail.map(item => validFloat(item.subtotTaxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTotal = invoiceDetail.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);

    let valueExonerated = 0;
    let valueTaxed = 0;
    let valueTaxes = 0;
    let totalInvoice = 0;
    if (documentExo === true || documentExo === 1) {
      valueExonerated = validFloat(taxedValue) + sumTaxed;
      valueTaxed = 0;
      valueTaxes = 0;
      totalInvoice = (validFloat(totalProd) + sumTotal) - (sumTaxes + taxValue);
    } else {
      valueExonerated = 0;
      valueTaxed = validFloat(taxedValue) + sumTaxed;
      valueTaxes = validFloat(taxValue) + sumTaxes;
      totalInvoice = validFloat(totalProd) + sumTotal;
    }

    const addProduct = {
      subTotalValue: validFloat(subtotal) + sumSubtotal,
      discountValue: validFloat(discountValue) + sumDiscount,
      subTotExeValue: validFloat(exemptValue) + sumExempt,
      subTotExoValue: valueExonerated,
      subtotTaxValue: valueTaxed,
      taxValue: valueTaxes,
      total: totalInvoice
    }
    setBulkFormIndex(addProduct);

    setInvoiceDetail(current => [...current, detail]);
    // limpiar inputs para agregar otro producto
    const cleanProd = {
      productCode: "",
      description: "",
      qty: 0,
      price: 0,
      subtotal: 0,
      discountPercent: 0,
      discountValue: 0,
      taxPercent: 0,
      taxValue: 0,
      total: 0,
      unitedCoste: 0,
      qtyDist: 0,
      unitedOut: "",
      unitProd: "",
      lotCode: "",
      dateOut: ""
    }
    setBulkFormDetail(cleanProd);
    setSendFormDetail(false);
  }

  const fnDeleteOkProduct = () => {
    setOpenMsgQuestion(false);
    const newArray = invoiceDetail.filter((item) => item.id !== idProd);
    setInvoiceDetail(newArray);

    const sumSubtotal = newArray.map(item => validFloat(item.subtotal)).reduce((prev, curr) => prev + curr, 0);
    const sumDiscount = newArray.map(item => validFloat(item.discountValue)).reduce((prev, curr) => prev + curr, 0);
    const sumExempt = newArray.map(item => validFloat(item.subTotExeValue)).reduce((prev, curr) => prev + curr, 0);

    const sumTaxes = newArray.map(item => validFloat(item.taxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTaxed = newArray.map(item => validFloat(item.subtotTaxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTotal = newArray.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);

    let valueExonerated = 0;
    let valueTaxed = 0;
    let valueTaxes = 0;
    let totalInvoice = 0;
    if (documentExo === true || documentExo === 1) {
      valueExonerated = sumTaxed
      valueTaxed = 0;
      valueTaxes = 0;
      totalInvoice = sumTotal - sumTaxes;
    } else {
      valueExonerated = 0;
      valueTaxed = sumTaxed;
      valueTaxes = sumTaxes;
      totalInvoice = sumTotal;
    }

    const deleteProd = {
      subTotalValue: validFloat(sumSubtotal),
      discountValue: sumDiscount,
      subTotExeValue: sumExempt,
      subTotExoValue: valueExonerated,
      subtotTaxValue: valueTaxed,
      taxValue: valueTaxes,
      total: totalInvoice
    }
    setBulkFormIndex(deleteProd);
  }

  const fnDeleteProduct = (itemProd) => {
    setIdProd(itemProd.id);
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnChangePrice = () => {
    setOpenModalPrice(true);
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useBill=1', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          id: item.code,
          code: item.code,
          name: `${item.code} | ${item.name}`
        }
      });
      setListTypeDocuments(documents);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('billing/settings/customers/?status=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id,
          rtn: item.rtn,
          name: item.nomcli,
          email: item.email
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/areas?status=1', (resp) => {
      const areas = resp.data;
      setListAreas(areas);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const warehouse = resp.data;
      setListWarehouse(warehouse);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/users?isSeller=1&status=1', (resp) => {
      const users = resp.data.map((item) => {
        return {
          label: `${item.sellerCode} | ${item.name}`,
          value: item.id,
          code: item.sellerCode
        }
      });
      setListSellers(users);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    request.GET('admin/companies/getOperationalSettings', (resp) => {
      setHasSellerControl(!!resp.data.hasSellerControl);
      setHasDateOutControl(!!resp.data.hasDateOutControl);
      setHasStoreControl(!!resp.data.hasStoreControl);
      setHasStockControl(!!resp.data.hasStockControl);
      setDateFormat(resp.data.formatDate || 'DMY');
    }, (err) => {

    });
  }, []);

  useEffect(() => {
    if (recordSelected.id) {
      setBulkFormIndex(recordSelected);
    } else {
      onResetFormIndex();
    }
  }, [recordSelected]);

  // Recalcula el estado de crédito cada vez que cambia el cliente o el tipo de venta,
  // igual que el legacy (se dispara al elegir cliente y al alternar Contado/Crédito).
  useEffect(() => {
    if (validInt(documentType) !== 2 || validInt(customerId) === 0) {
      setCreditLimit(0);
      setCreditCurrent(0);
      return;
    }
    request.GET(`billing/settings/customers/${customerId}`, (resp) => {
      setCreditLimit(validFloat(resp.data.limcred));
    }, (err) => {

    });
    request.GET(buildUrl('accounting/process/cxc/pendingByCustomer', { customerId }), (resp) => {
      const pending = resp.data.reduce((sum, item) => sum + validFloat(item.balance), 0);
      setCreditCurrent(pending);
    }, (err) => {

    });
  }, [customerId, documentType]);

  const propsToControlPanel = {
    fnNew: fnNewInvoicing,
    fnSearch: fnSearchInvoicing,
    fnSave: fnSaveInvoicing,
    fnPrint: fnPrintInvoicing,
    fnCancel: voidControl.fnDelete ? fnCancelInvoicing : null,
    buttonsHome: [
      {
        title: "button.quotation",
        icon: "bi bi-file-text",
        onClick: fnQuotation
      },
      {
        title: "button.invoice",
        icon: "bi bi-receipt",
        onClick: fnInvoice
      },
      {
        title: "button.deliver",
        icon: "bi bi-clipboard2-check",
        onClick: fnDeliver
      },
      {
        title: "button.loadPurchaseOrder",
        icon: "bi bi-file-earmark-arrow-down",
        onClick: fnSearchPurchaseOrderToLoad
      },
      {
        title: "button.printProforma",
        icon: "bi bi-file-earmark-text",
        onClick: fnPrintProforma
      },
      {
        title: "button.sendEmail",
        icon: "bi bi-envelope",
        onClick: fnOpenSendEmail
      }
    ],
    buttonsOptions: [
      editInfoControl.fnUpdate && {
        title: "button.editCostDistribution",
        icon: "bi bi-sliders",
        onClick: fnEditCostDist
      },
      editInfoControl.fnUpdate && {
        title: "button.editInfo",
        icon: "bi bi-pencil-square",
        onClick: fnEditInfo
      }
    ],
    buttonsAdmin: []
  }

  const propsToModalProducts = {
    ModalContent: ModalProducts,
    title: "page.invoicing.modal.products.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
      listProducts
    }
  }

  const propsToModalInvoices = {
    ModalContent: ModalInvoices,
    title: "page.invoicing.modal.invoices.title",
    open: openModalInvoices,
    setOpen: setOpenModalInvoices,
    maxWidth: 'xl',
    data: {
      dataInvoicing
    }
  }

  const propsToModalPrices = {
    ModalContent: ModalChangePrice,
    title: "page.invoicing.modal.changePrice.title",
    open: openModalPrice,
    setOpen: setOpenModalPrice,
    maxWidth: 'sm',
    data: {
      typePrice,
      priceLocalMin,
      priceLocalMid,
      priceLocalMax,
      otherPriceProd,
      qty,
      discountPercent,
      taxPercent,
      onInputDetaChange,
      setBulkFormDetail
    }
  }

  const propsToModalPrint = {
    ModalContent: ModalPrintInvoice,
    title: "page.invoicing.modal.printInvoice.title",
    open: openModalPrint,
    setOpen: setOpenModalPrint,
    maxWidth: 'sm',
    data: {
      id,
      setLoading
    }
  }

  const propsToModalGenerate = {
    ModalContent: ModalGenerateInvoice,
    title: "page.invoicing.modal.generateInvoice.title",
    open: openModalGenerate,
    setOpen: setOpenModalGenerate,
    maxWidth: 'lg',
    data: {
      id,
      subTotalValue,
      discount,
      subTotExeValue,
      subTotExoValue,
      subtotTaxValue,
      taxValueInvoice,
      total,
      currency,
      setLoading,
      userData,
      onInputChangeIndex
    }
  }

  const propsToModalQuotation = {
    ModalContent: ModalQuotation,
    title: "page.invoicing.modal.generateQuotation.title",
    open: openModalQuotation,
    setOpen: setOpenModalQuotation,
    maxWidth: 'md',
    data: {
      id,
      customerId,
      listCustomers,
      setLoading
    }
  }

  const propsToModalDeliveryDoc = {
    ModalContent: ModalDeliveryDoc,
    title: "page.invoicing.modal.deliveryDoc.title",
    open: openModalDeliveryDoc,
    setOpen: setOpenModalDeliveryDoc,
    maxWidth: 'md',
    data: {
      id,
      customerId,
      listCustomers,
      setLoading
    }
  }

  const propsToModalCreditStatus = {
    ModalContent: ModalCreditStatus,
    title: "page.invoicing.modal.creditStatus.title",
    open: openModalCreditStatus,
    setOpen: setOpenModalCreditStatus,
    maxWidth: 'sm',
    data: {
      creditLimit,
      creditCurrent
    }
  }

  const propsToModalEditCostDist = {
    ModalContent: ModalEditCostDist,
    title: "page.invoicing.modal.editCostDist.title",
    open: openModalEditCostDist,
    setOpen: setOpenModalEditCostDist,
    maxWidth: 'xl',
    data: {
      id,
      setLoading
    }
  }

  const propsToModalSeekPurchaseOrders = {
    ModalContent: ModalSeekPurchaseOrders,
    title: "page.invoicing.modal.seekPurchaseOrders.title",
    open: openModalSeekPurchaseOrders,
    setOpen: setOpenModalSeekPurchaseOrders,
    maxWidth: 'lg',
    data: {
      dataPurchaseOrders: dataSeekPurchaseOrders,
      fnViewItem: fnLoadPurchaseOrder,
      dateFormat
    }
  }

  const propsToModalProforma = {
    ModalContent: ViewPdf,
    title: "page.invoicing.modal.proforma.title",
    open: openModalProforma,
    setOpen: setOpenModalProforma,
    maxWidth: 'xl',
    data: {
      documentPath: documentPathProforma
    }
  }

  const propsToModalChangeProduct = {
    ModalContent: ModalChangeProduct,
    title: "page.invoicing.modal.changeProduct.title",
    open: openModalChangeProduct,
    setOpen: setOpenModalChangeProduct,
    maxWidth: 'lg',
    data: {
      invoiceId: id,
      line: selectedChangeLine,
      storeId,
      setLoading,
      fnSuccess: fnChangeProductSuccess
    }
  }

  const propsToModalEditInfo = {
    ModalContent: ModalEditInvoiceInfo,
    title: "page.invoicing.modal.editInfo.title",
    open: openModalEditInfo,
    setOpen: setOpenModalEditInfo,
    maxWidth: 'lg',
    data: {
      id,
      hasSellerControl,
      listSellers,
      setLoading,
      fnSuccess: fnEditInfoSuccess
    }
  }

  const propsToModalSendEmail = {
    ModalContent: ModalSendEmail,
    title: "button.sendEmail",
    open: openSendEmail,
    setOpen: setOpenSendEmail,
    maxWidth: 'md',
    data: {
      setLoading,
      sendUrl: 'billing/process/invoices/sendEmail',
      documentId: id,
      attachmentName: `Factura_${id}.pdf`,
      defaultTo: listCustomers.find((item) => item.value === customerId)?.email || '',
      defaultSubject: `${IntlMessagesFn('page.invoicing.modal.sendEmail.defaultSubject')} ${id}`,
      defaultBody: IntlMessagesFn('page.invoicing.modal.sendEmail.defaultBody')
    }
  }

  const propsToInvoicingForm = {
    documentCode,
    customerId,
    notes,
    documentType,
    currency,
    date,
    dateInProcess,
    areaId,
    storeId,
    cashierId,
    documentExo,
    documentId,
    numcai,
    listTypeDocuments,
    listCustomers,
    listAreas,
    listWarehouse,
    listSellers,
    handleAreaChange,
    handleExemptChange,
    recordSelected,
    onInputChangeIndex,
    formValidationIndex,
    sendFormIndex,
    setBulkFormIndex,
    onInputDetaChange,
    hasSellerControl,
    isInvoiceSaved,
    creditStatusLevel,
    fnViewCreditStatus
  }

  const propsToInvoicingDetail = {
    productCode, description, unitProd, qty, price, subtotal, discountPercent, discountValue, taxPercent, taxValue,
    totalProd, onInputDetaChange, handleQtyChange, handlePriceChange, handleDiscPercentChange, handleTaxPercentChange,
    fnViewProducts, fnChangePrice, fnAddProduct, formValidationDetail, sendFormDetail, isInvoiceSaved,
    lotCode, dateOut, hasDateOutControl
  }

  const propsToInvoicingTable = {
    invoiceDetail, subTotalValue, discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValueInvoice, total, onInputChangeIndex,
    fnDeleteProduct, isInvoiceSaved, hasDateOutControl, fnOpenChangeProduct, canChangeProduct: changeProductControl.fnUpdate
  }

  const propsToMsgCancelInvoice = {
    open: openMsgCancelInvoice,
    setOpen: setOpenMsgCancelInvoice,
    fnOnOk: fnCancelInvoice,
    title: "msg.question.cancelInvoice.title"
  }

  const propsToModalVoidInvoice = {
    ModalContent: ModalVoidInvoice,
    title: "button.cancel2",
    open: openModalVoidInvoice,
    setOpen: setOpenModalVoidInvoice,
    maxWidth: "md",
    data: {
      invoiceNumber: `${documentCode}-${documentId}`,
      numcai,
      fnConfirm: fnVoidInvoice
    }
  }

  const propsToMsgGenerateInvoice = {
    open: openMsgGenerateInvoice,
    setOpen: setOpenMsgGenerateInvoice,
    fnOnOk: fnGenerateInvoice,
    title: "msg.question.generateInvoice.title"
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDeleteOkProduct,
    title: "alert.question.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <InvoicingForm {...propsToInvoicingForm} />
              <InvoicingDetail {...propsToInvoicingDetail} />
              <InvoicingTable {...propsToInvoicingTable} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalProducts} />
      <Modal {...propsToModalInvoices} />
      <Modal {...propsToModalPrices} />
      <Modal {...propsToModalPrint} />
      <Modal {...propsToModalGenerate} />
      <Modal {...propsToModalQuotation} />
      <Modal {...propsToModalDeliveryDoc} />
      <Modal {...propsToModalVoidInvoice} />
      <Modal {...propsToModalCreditStatus} />
      <Modal {...propsToModalEditCostDist} />
      <Modal {...propsToModalSeekPurchaseOrders} />
      <Modal {...propsToModalProforma} />
      <Modal {...propsToModalChangeProduct} />
      <Modal {...propsToModalEditInfo} />
      <Modal {...propsToModalSendEmail} />
      <Confirmation {...propsToMsgDelete} />
      <Confirmation {...propsToMsgCancelInvoice} />
      <Confirmation {...propsToMsgGenerateInvoice} />
    </>
  );
}
export default Invoicing;