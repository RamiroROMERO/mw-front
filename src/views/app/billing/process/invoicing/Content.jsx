import { useEffect, useState } from 'react';
import { Alert, Card, CardBody, Row } from 'reactstrap';
import { validFloat, formatNumber, validInt, IntlMessagesFn, IntlMessages } from "@Helpers/Utils";
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { getErrorCode } from '@Helpers/errorMessage';
import { useForm } from '@Hooks'
import ControlPanel from '@Components/controlPanel';
import TableButton from "@Components/tableButtons";
import notification from '@Containers/ui/Notifications';
import DateHelper from '@Helpers/DateHelper';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import ModalProducts from './ModalProducts';
import ModalGlobalDiscount from './ModalGlobalDiscount';
import ModalInvoices from './ModalViewInvoi';
import ModalChangePrice from './ModalChangePrice';
import ModalPrintInvoice from './ModalPrintInvoice';
import ModalGenerateInvoice from './ModalGenerateInvoice';
import ModalSeekQuotes from '../quotes/ModalSeekQuotes';
import { printDocument } from '@Helpers/printDocument';
import { proformaPrintOptions, deliveryPrintOptions, canDeliver, emailUrl } from './invoicePrintRules';
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
import {
  API_PATH, CREDIT_STATUS_PATH, buildInvoicePayload, creditAlertLevel, creditWarningIds, paymentStatusColor, paymentStatusId, hasStockProblem, headerFromApi, headerFromDocument, lineFromApi, lineFromDocument, lineFromProduct, listParams, needsLotOrDate,
  totalsFromLines, validateInvoice, warningTexts
} from './invoicingRules';

const Invoicing = (props) => {
  const { setLoading, voidControl, editInfoControl, changeProductControl } = props;
  const [listTypeDocuments, setListTypeDocuments] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [listAreas, setListAreas] = useState([]);
  const [listWarehouse, setListWarehouse] = useState([]);
  const [listSellers, setListSellers] = useState([]);
  const [discountOptions, setDiscountOptions] = useState([]);
  const [pendingLoad, setPendingLoad] = useState(null);
  const [openMsgLoadDocument, setOpenMsgLoadDocument] = useState(false);
  const [openModalSeekQuotes, setOpenModalSeekQuotes] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState([]);
  const [dataInvoicing, setDataInvoicing] = useState([]);
  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [openModalGlobalDiscount, setOpenModalGlobalDiscount] = useState(false);
  const [openModalInvoices, setOpenModalInvoices] = useState(false);
  const [openModalPrice, setOpenModalPrice] = useState(false);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [openModalGenerate, setOpenModalGenerate] = useState(false);
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
  const [creditStatus, setCreditStatus] = useState(null);
  const [openModalCreditStatus, setOpenModalCreditStatus] = useState(false);
  const [openModalEditCostDist, setOpenModalEditCostDist] = useState(false);
  const [openModalSeekPurchaseOrders, setOpenModalSeekPurchaseOrders] = useState(false);
  const [dateFormat, setDateFormat] = useState('DMY');
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
    paymentStatus: null,
    exonerationOrderNumber: '',
    documentId: 0,
    isDeleted: 0,
    nulledNotes: '',
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
    discountId: 0,
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
    unitId: 0,
    qtyDist: 0,
    haveComiss: 0,
    lotCode: '',
    dateOut: '',
    productType: 0,
    existQty: 0,
    requireExpLot: 0
  }, invoiceDetailValid);

  const { productCode, description, unitProd, qty, price, subtotal, discountPercent, discountId, discountValue, taxPercent, taxValue,
    total: totalProd, typePrice, priceLocalMin, priceLocalMid, priceLocalMax, otherPriceProd, unitedCoste, unitedOut, unitId, qtyDist,
    haveComiss, areaId, storeId, lotCode, dateOut, productType, existQty, requireExpLot } = formDetail;

  const { id, customerId, notes, documentCode, documentType, currency, date, dateInProcess, cashierId,
    documentExo, paymentStatus, exonerationOrderNumber, documentId, isDeleted, nulledNotes, numcai, subTotalValue, discountValue: discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValue:
    taxValueInvoice, total } = formIndex;

  // Documento Fiscal ya fue Generado (CAI asignado) — igual que el legacy
  // (fac_facturacion.sc2: si Textbox_hw48/documentId != 0, bloquea modificar el
  // documento): ya no se puede editar la cabecera ni el detalle, solo consultar/imprimir.
  // Anulada (SPEC v2-70-sr): también es de solo lectura.
  const isVoided = validInt(isDeleted) === 1;
  const isInvoiceSaved = validInt(documentId) > 0 || isVoided;
  const voidedNotice = IntlMessages('page.invoicing.voided.notice');
  // Estado de pago de una factura fiscal (SPEC v2-73-sr, desde la CxC en el servidor): el texto se pide siempre (IntlMessages es un hook) y se muestra solo si aplica.
  const paymentStatusText = IntlMessages(paymentStatusId(paymentStatus) || 'page.invoicing.paymentStatus.pending');

  // Estado del crédito del cliente (SPEC v2-73-sr): el servidor calcula límite, saldo de la CxC, disponible, porcentaje y nivel (`GET creditStatus`); solo aplica a
  // ventas a Crédito (como el legacy) y solo AVISA. Sin límite configurado no hay alerta.
  const creditStatusLevel = validInt(documentType) === 2 && validInt(customerId) > 0 ? creditAlertLevel(creditStatus) : null;

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
      discountPercent: e.target.value,
      discountId: 0 // un porcentaje digitado a mano ya no es el de un descuento del catálogo
    }
    setBulkFormDetail(newDiscount);
  }

  // Descuento del catálogo (fac_desc): carga su porcentaje y guarda su id en la línea (como F1 en el legacy).
  const handleDiscountSelect = e => {
    const chosen = discountOptions.find((item) => String(item.id) === String(e.target.value));
    const percent = chosen ? Number(chosen.percentValue) : 0;
    const discount1 = validFloat((percent * subtotal) / 100);
    const tax3 = validFloat((taxPercent * (subtotal - discount1)) / 100);
    setBulkFormDetail({
      discountId: chosen ? chosen.id : 0,
      discountPercent: percent,
      discountValue: discount1,
      taxValue: tax3,
      total: validFloat((subtotal - discount1) + tax3)
    });
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

  // GET /:id trae la cabecera y las líneas (nombres nuevos, SPEC v2-68-sr): se traducen a los nombres que usa el formulario.
  const fnViewInvoice = (item) => {
    onResetFormIndex();
    setLoading(true);
    request.GET(`${API_PATH}/${item.id}`, (resp) => {
      const { details, ...header } = resp.data;
      setRecordSelected(headerFromApi(header));
      setInvoiceDetail((details || []).map(lineFromApi));
      setOpenModalInvoices(false);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // Listado paginado del servidor (las 100 más recientes; el servidor admite `search`, `limit` y `offset`).
  const fnSearchInvoicing = () => {
    setLoading(true);
    request.GET(buildUrl(API_PATH, listParams()), (resp) => {
      const invoices = resp.data.map((item) => {
        item.value = formatNumber(item.total);
        item.numcai = item.fiscalNumber;
        item.stateKey = validInt(item.isVoided) === 1 ? 'voided' : validInt(item.documentId) > 0 ? 'fiscal' : 'draft';
        item.options = <TableButton color='primary' icon='eye' fnOnClick={() => fnViewInvoice(item)} />
        return item;
      });
      setDataInvoicing(invoices);
      setOpenModalInvoices(true);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // Un solo POST (alta) o PUT (edición) con la cabecera y las líneas: el servidor las guarda en una transacción y calcula importes, costo y distribución
  // (SPEC v2-68-sr). El formulario solo avisa lo que ya sabe que el servidor rechazaría; los errores de negocio los muestra `request` con su mensaje real.
  const fnSaveInvoicing = () => {
    if (isVoided) {
      notification('warning', 'page.invoicing.voided.alreadyVoided', 'alert.warning.title');
      return;
    }
    setSendFormIndex(true);
    if (!isFormValidIndex) {
      return;
    }

    const errors = validateInvoice(formIndex, invoiceDetail, { hasSellerControl });
    const firstError = Object.values(errors)[0];
    if (firstError) {
      notification('warning', firstError, 'alert.warning.title');
      return;
    }

    const payload = buildInvoicePayload(formIndex, invoiceDetail);
    setLoading(true);
    // Se recarga lo guardado: los importes de las líneas son los que calculó el servidor.
    const onSaved = (resp) => {
      // Existencia insuficiente: solo aviso (el servidor bloquea al generar el documento fiscal).
      warningTexts(resp.data?.warnings, (item) => `${item.productCode}: ${item.requested} / ${item.available}`).forEach((text) => notification('warning', { text }, 'alert.warning.title'));
      // Crédito del cliente: solo avisa (SPEC v2-73-sr).
      creditWarningIds(resp.data?.warnings).forEach((warningId) => notification('warning', warningId, 'alert.warning.title'));
      fnViewInvoice({ id: resp.data.id });
    };
    const onFailed = () => {
      setLoading(false);
    };
    if (id && id > 0) {
      request.PUT(`${API_PATH}/${id}`, payload, onSaved, onFailed);
    } else {
      request.POST(API_PATH, payload, onSaved, onFailed);
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

  // Anular (SPEC v2-70-sr): un borrador solo se marca anulado; un documento fiscal revierte además kardex, partida y CxC. En los dos casos pide el motivo.
  const fnCancelInvoicing = () => {
    if (!(id > 0)) return;
    if (isVoided) {
      notification('warning', 'page.invoicing.voided.alreadyVoided', 'alert.warning.title');
      return;
    }
    setOpenModalVoidInvoice(true);
  }

  // DELETE .../:id/void?reason=: una transacción en el servidor (período, lock, reversa, bitácora y auditoría). Se recarga el documento anulado; los errores muestran su
  // mensaje real (pagos aplicados, período cerrado, sin privilegio...).
  const fnVoidInvoice = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`${API_PATH}/${id}/void`, { reason }), () => {
      setOpenModalVoidInvoice(false);
      notification('success', 'msg.success.voidInvoice', 'alert.success.title');
      fnViewInvoice({ id });
    }, (err) => {
      if (getErrorCode(err) === 'invoice.hasPayments') {
        notification('error', 'msg.error.voidInvoice.hasPayments', 'alert.error.title');
      } else {
        notifyError(err, 'msg.delete.record.error');
      }
      setLoading(false);
    }, false);
  }

  const fnInvoice = () => {
    if (isVoided) {
      notification('warning', 'page.invoicing.voided.alreadyVoided', 'alert.warning.title');
    } else if (id > 0 && documentId === 0) {
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
    // El buscador de órdenes pide sus propias páginas al servidor (SPEC v2-67-sr).
    setOpenModalSeekPurchaseOrders(true);
  }

  // Solo trae las líneas de productos de la Orden de Compra (se agregan al detalle
  // actual, sin reemplazarlo) — igual que el flujo activo del legacy, que NO copia
  // cliente/cabecera de la orden, solo sus productos.
  // Cargar una cotización o una orden de compra de clientes en una factura NUEVA (SPEC v2-71-sr): copia las líneas (con los precios del documento; el servidor
  // vuelve a validar todo al guardar) y la cabecera (cliente, vendedor y, de la orden, la exoneración con su constancia). Con líneas ya agregadas pide confirmación
  // y las reemplaza.
  const fnDoLoadDocument = (kind, row) => {
    setLoading(true);
    const url = kind === 'order' ? `billing/process/purchaseOrders/${row.id}` : `billing/process/quotes/${row.id}`;
    request.GET(url, (resp) => {
      const document = resp.data || {};
      const headerPatch = headerFromDocument(document);
      const sellerId = headerPatch.cashierId || cashierId;
      const sellerData = listSellers.find((item) => item.value === sellerId);
      const newLines = (document.details || []).map((line) => lineFromDocument(line, { areaId: validInt(areaId), storeId: validInt(storeId), sellerCode: sellerData ? sellerData.code : '' }));
      const isExo = headerPatch.documentExo === true || documentExo === true || documentExo === 1;
      setInvoiceDetail(newLines);
      setBulkFormIndex({ ...headerPatch, ...totalsFromLines(newLines, isExo) });
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const fnLoadDocument = (kind, row) => {
    setOpenModalSeekPurchaseOrders(false);
    setOpenModalSeekQuotes(false);
    if (invoiceDetail.length > 0) {
      setPendingLoad({ kind, row });
      setOpenMsgLoadDocument(true);
      return;
    }
    fnDoLoadDocument(kind, row);
  }

  const fnLoadPurchaseOrder = (row) => fnLoadDocument('order', row);
  const fnLoadQuotation = (row) => fnLoadDocument('quote', row);

  const fnConfirmLoadDocument = () => {
    setOpenMsgLoadDocument(false);
    if (pendingLoad) fnDoLoadDocument(pendingLoad.kind, pendingLoad.row);
    setPendingLoad(null);
  }

  // Descuento global (SPEC v2-71-sr): solo en una factura sin guardar y con líneas; reemplaza el descuento de cada línea y recalcula los totales.
  const fnGlobalDiscount = () => {
    if (isInvoiceSaved) return;
    if (invoiceDetail.length === 0) {
      notification('warning', 'msg.required.select.product', 'alert.warning.title');
      return;
    }
    setOpenModalGlobalDiscount(true);
  }

  const fnApplyGlobalDiscount = (newLines) => {
    setInvoiceDetail(newLines);
    setBulkFormIndex(totalsFromLines(newLines, documentExo === true || documentExo === 1));
  }

  const fnSearchQuotationToLoad = () => {
    if (id > 0) {
      return;
    }
    if (validInt(areaId) === 0 || validInt(storeId) === 0 || (hasSellerControl && validInt(cashierId) === 0)) {
      notification('warning', 'msg.required.areaStoreSeller', 'alert.warning.title');
      return;
    }
    setOpenModalSeekQuotes(true);
  }

  // Documento de entrega (SPEC v2-74-sr): el back lo arma de lo guardado y exige documento fiscal, teléfono y dirección del cliente (su mensaje llega a pantalla).
  const fnDeliver = () => {
    if (canDeliver({ id, documentId })) {
      printDocument({ ...deliveryPrintOptions({ id }), setLoading });
    } else if (id > 0) {
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
  // Cambiar tipo de venta o exoneración regenera totales, partida y CxC en el servidor: se recarga la factura guardada.
  const fnEditInfoSuccess = () => {
    fnViewInvoice({ id });
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
    printDocument({ ...proformaPrintOptions({ id }), setLoading });
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

  // Línea nueva a partir de un producto del buscador (SPEC v2-71-sr): precios sin el ISV incluido, costo y comisión los fija el servidor.
  const fnSelectProduct = (item) => {
    onResetFormDetail();
    // El reinicio del formulario del producto borraba el área, el almacén y el tipo de precio elegidos arriba: se conservan (la línea los necesita).
    setBulkFormDetail(lineFromProduct(item, { areaId, storeId, typePrice }));
    setOpenModalProducts(false);
  }

  // El buscador pide sus propias páginas al servidor, con la existencia del almacén elegido (antes bajaba el catálogo completo).
  const fnViewProducts = () => {
    setOpenModalProducts(true);
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
    if (needsLotOrDate({ requireExpLot, lotCode, dateOut }, { hasDateOutControl })) {
      notification('warning', 'page.invoicing.error.line.lot', 'alert.warning.title');
      return;
    }

    if (hasStockProblem({ productType, qty, qtyDist, existQty }, { hasStoreControl, hasStockControl })) {
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
      discountId: validInt(discountId),
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
      unitId: validInt(unitId),
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
      discountId: 0,
      discountValue: 0,
      taxPercent: 0,
      taxValue: 0,
      total: 0,
      unitedCoste: 0,
      qtyDist: 0,
      unitedOut: "",
      unitId: 0,
      unitProd: "",
      lotCode: "",
      dateOut: "",
      requireExpLot: 0
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
          label: `${item.id} | ${item.dni} | ${item.name}`,
          value: item.id,
          rtn: item.dni,
          name: item.name,
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
    request.GET('admin/discounts/getSL', (resp) => setDiscountOptions(resp.data.map((item) => ({ ...item, name: `${item.name} (${Number(item.percentValue)}%)` }))), () => { });
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

  // Consulta el estado de crédito cada vez que cambia el cliente o el tipo de venta, igual que el legacy (al elegir cliente y al alternar Contado/Crédito).
  const fnLoadCreditStatus = (customer) => {
    request.GET(buildUrl(CREDIT_STATUS_PATH, { customerId: customer }), (resp) => {
      setCreditStatus(resp.data);
    }, () => {
      setCreditStatus(null);
    });
  };

  useEffect(() => {
    if (validInt(documentType) !== 2 || validInt(customerId) === 0) {
      setCreditStatus(null);
      return;
    }
    fnLoadCreditStatus(customerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        onClick: fnSearchQuotationToLoad
      },
      {
        title: "button.globalDiscount",
        icon: "bi bi-percent",
        onClick: fnGlobalDiscount
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

  const propsToModalGlobalDiscount = {
    ModalContent: ModalGlobalDiscount,
    title: "page.invoicing.modal.globalDiscount.title",
    open: openModalGlobalDiscount,
    setOpen: setOpenModalGlobalDiscount,
    maxWidth: 'sm',
    data: {
      lines: invoiceDetail,
      fnApply: fnApplyGlobalDiscount
    }
  }

  const propsToModalProducts = {
    ModalContent: ModalProducts,
    title: "page.invoicing.modal.products.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
      storeId: validInt(storeId),
      fnSelect: fnSelectProduct
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
      documentType,
      setLoading,
      onInputChangeIndex
    }
  }

  const propsToModalSeekQuotes = {
    ModalContent: ModalSeekQuotes,
    title: "page.invoicing.modal.seekQuotes.title",
    open: openModalSeekQuotes,
    setOpen: setOpenModalSeekQuotes,
    maxWidth: 'lg',
    data: {
      fnViewItem: fnLoadQuotation,
      dateFormat
    }
  }

  const propsToMsgLoadDocument = {
    open: openMsgLoadDocument,
    setOpen: setOpenMsgLoadDocument,
    fnOnOk: fnConfirmLoadDocument,
    title: "page.invoicing.msg.loadDocument.title"
  }

  const propsToModalCreditStatus = {
    ModalContent: ModalCreditStatus,
    title: "page.invoicing.modal.creditStatus.title",
    open: openModalCreditStatus,
    setOpen: setOpenModalCreditStatus,
    maxWidth: 'sm',
    data: {
      creditStatus
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
      fnViewItem: fnLoadPurchaseOrder,
      dateFormat
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
      sendUrl: emailUrl(id),
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
    exonerationOrderNumber,
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
    totalProd, onInputDetaChange, handleQtyChange, handlePriceChange, handleDiscPercentChange, handleTaxPercentChange, discountId, discountOptions, handleDiscountSelect,
    fnViewProducts, fnChangePrice, fnAddProduct, formValidationDetail, sendFormDetail, isInvoiceSaved,
    lotCode, dateOut, hasDateOutControl
  }

  const propsToInvoicingTable = {
    invoiceDetail, subTotalValue, discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValueInvoice, total, onInputChangeIndex,
    fnDeleteProduct, isInvoiceSaved, hasDateOutControl, fnOpenChangeProduct, canChangeProduct: changeProductControl.fnUpdate && !isVoided
  }

  const propsToModalVoidInvoice = {
    ModalContent: ModalVoidInvoice,
    title: "button.cancel2",
    open: openModalVoidInvoice,
    setOpen: setOpenModalVoidInvoice,
    maxWidth: "md",
    data: {
      invoiceNumber: validInt(documentId) > 0 ? `${documentCode}-${documentId}` : `${documentCode} #${id}`,
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
              {!isVoided && paymentStatusId(paymentStatus) && (
                <Alert color={paymentStatusColor(paymentStatus)} className="mb-3 py-2"><strong>{paymentStatusText}</strong></Alert>
              )}
              {isVoided && (
                <Alert color="danger" className="mb-3">
                  <strong>{voidedNotice}</strong>{nulledNotes ? `: ${nulledNotes}` : ''}
                </Alert>
              )}
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
      <Modal {...propsToModalSeekQuotes} />
      <Modal {...propsToModalGlobalDiscount} />
      <Modal {...propsToModalVoidInvoice} />
      <Modal {...propsToModalCreditStatus} />
      <Modal {...propsToModalEditCostDist} />
      <Modal {...propsToModalSeekPurchaseOrders} />
      <Modal {...propsToModalChangeProduct} />
      <Modal {...propsToModalEditInfo} />
      <Modal {...propsToModalSendEmail} />
      <Confirmation {...propsToMsgDelete} />
      <Confirmation {...propsToMsgGenerateInvoice} />
      <Confirmation {...propsToMsgLoadDocument} />
    </>
  );
}
export default Invoicing;