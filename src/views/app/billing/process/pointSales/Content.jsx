import { useState, useEffect } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { validFloat, formatNumber, validInt } from "@Helpers/Utils";
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks';
import DateHelper from '@Helpers/DateHelper';
import ControlPanel from '@Components/controlPanel';
import TableButton from "@Components/tableButtons";
import notification from '@Containers/ui/Notifications';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import ModalProducts from '../invoicing/ModalProducts';
import ModalChangePrice from '../invoicing/ModalChangePrice';
import ModalViewInvoi from '../invoicing/ModalViewInvoi';
import ModalCashOpening from './ModalCashOpening';
import ModalCashclose from './ModalCashClose';
import ModalCashOut from './ModalCashOut';
import ModalCancellations from './ModalCancellations';
import ModalQuotation from '../invoicing/ModalQuotation';
import ModalPayment from './ModalPayment';
import InvoicingForm from '../invoicing/InvoicingForm';
import InvoicingDetail from '../invoicing/InvoicingDetail';
import InvoicingTable from '../invoicing/InvoicingTableProd';
import ViewPdf from '@Components/ViewPDF/ViewPdf';

const PointSales = (props) => {
  const { setLoading } = props;
  const dataCashBox = JSON.parse(localStorage.getItem('dataCashBox_current'));
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const [listTypeDocuments, setListTypeDocuments] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [listAreas, setListAreas] = useState([]);
  const [listWarehouse, setListWarehouse] = useState([]);
  const [listSellers, setListSellers] = useState([]);
  const [listCashiers, setListCashiers] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [listCashBoxes, setListCashBoxes] = useState([]);
  const [listTypeExpenses, setListTypeExpenses] = useState([]);
  const [listTypePayments, setListTypePayments] = useState([]);
  const [listLedgerAccount, setListLedgerAccount] = useState([]);
  const [hasSellerControl, setHasSellerControl] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState([]);
  const [dataInvoicing, setDataInvoicing] = useState([]);
  const [recordSelected, setRecordSelected] = useState({});
  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [openModalInvoices, setOpenModalInvoices] = useState(false);
  const [openModalPrice, setOpenModalPrice] = useState(false);
  const [openModalCashOpening, setOpenModalCashOpening] = useState(false);
  const [openMsgCancelInvoice, setOpenMsgCancelInvoice] = useState(false);
  const [openModalCashClose, setOpenModalCashClose] = useState(false);
  const [openModalCashOut, setOpenModalCashOut] = useState(false);
  const [openModalCancellations, setOpenModalCancellations] = useState(false);
  const [openModalQuotation, setOpenModalQuotation] = useState(false);
  const [openModalPayment, setOpenModalPayment] = useState(false);
  const [sendFormIndex, setSendFormIndex] = useState(false);
  const [sendFormDetail, setSendFormDetail] = useState(false);

  //print invoice
  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState("");

  const invoicingValid = {
    documentCode: [(val) => val !== "0", "msg.required.select.typeDocument"],
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
    customerId: 1,
    customerDNI: '00000000000000',
    customerName: 'CONSUMIDOR FINAL',
    notes: '',
    documentCode: dataCashBox ? dataCashBox.documentCode : '',
    documentType: 1,
    currency: 1,
    printType: dataCashBox ? dataCashBox.printType : 1,
    // Por defecto igual a dateInProcess (venta nueva) — solo cambia a la fecha real
    // almacenada cuando se busca/carga una factura existente (fnViewInvoice), y ahí
    // el campo queda deshabilitado (el usuario no debe poder modificarla).
    date: DateHelper.format(new Date()),
    dateInProcess: DateHelper.format(new Date()),
    cashierId: 0,
    documentExo: false,
    documentId: 0,
    subTotalValue: 0,
    discountValue: 0,
    subTotExeValue: 0,
    subTotExoValue: 0,
    subtotTaxValue: 0,
    taxValue: 0,
    total: 0,
    valueCustomer: 0,
    valueRestore: 0
  }, invoicingValid);

  const { formState: formDetail, formValidation: formValidationDetail, isFormValid: isFormValidDetail, onInputChange: onInputDetaChange, onResetForm: onResetFormDetail, setBulkForm: setBulkFormDetail } = useForm({
    productCode: '',
    description: '',
    areaId: dataCashBox ? dataCashBox.areaId : 0,
    storeId: dataCashBox ? dataCashBox.storeId : 0,
    unitProd: '',
    qty: 0,
    price: 0,
    subtotal: 0,
    discountPercent: 0,
    discountValue: 0,
    taxPercent: 0,
    taxValue: 0,
    total: 0,
    typePrice: dataCashBox ? dataCashBox.typePrice : 0,
    priceLocalMin: 0,
    priceLocalMid: 0,
    priceLocalMax: 0,
    otherPriceProd: 0,
    unitedCoste: 0,
    unitedOut: 0,
    qtyDist: 0,
    haveComiss: 0,
    productType: 0
  }, invoiceDetailValid);

  const { id, customerId, customerDNI, customerName, notes, documentCode, documentType, currency, printType, date, dateInProcess, cashierId, documentExo, documentId, subTotalValue, discountValue: discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValue: taxValueInvoice, total, valueCustomer, valueRestore } = formIndex;

  const { productCode, description, unitProd, qty, price, subtotal, discountPercent, discountValue, taxPercent, taxValue, total: totalProd, typePrice, priceLocalMin, priceLocalMid, priceLocalMax, otherPriceProd, unitedCoste, unitedOut, qtyDist, haveComiss, areaId, storeId, productType } = formDetail;

  const handleAreaChange = e => {
    let valueStore = "0";
    let typePricelocal = 2;
    if (e.target.value > 0) {
      const dataArea = listAreas.filter((item) => {
        return item.id === parseInt(e.target.value, 10);
      });
      valueStore = dataArea[0].invStore !== null ? dataArea[0].invStore.id : "0";
      typePricelocal = dataArea[0].localPriceType;
    } else {
      valueStore = "0";
      typePricelocal = 2;
    }
    const newArea = {
      areaId: e.target.value,
      storeId: valueStore,
      typePrice: validInt(typePricelocal)
    }
    setBulkFormDetail(newArea);
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
      documentExo: !e.target.checked
    }
    setBulkFormIndex(addProduct);
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
    const total3 = validFloat((subtotal - discount1) + taxValue);
    const newDiscount = {
      total: total3,
      discountValue: discount1,
      taxValue: tax3,
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

  const fnNewInvoicing = () => {
    if (dataCashBox && !dataCashBox.cashId) {
      return;
    }
    setInvoiceDetail([]);
    onResetFormIndex();
    onResetFormDetail();
    setSendFormIndex(false);
    setSendFormDetail(false);
  }

  const fnSearchInvoicing = () => {
    if (dataCashBox && !dataCashBox.cashId) {
      return;
    }
    setLoading(true);
    request.GET('billing/process/invoices', (resp) => {
      const invoices = resp.data.map((item) => {
        item.value = formatNumber(item.total);
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

  const fnViewInvoice = (item) => {
    onResetFormIndex();
    setRecordSelected(item);

    request.GET(buildUrl('billing/process/invoiceDetail', { idFather: item.id }), (resp) => {
      const invoiceProducts = resp.data.map((item2) => {
        return {
          id: item2.id,
          productCode: item2?.productCode || "",
          description: item2?.invProduct?.name || "",
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
          haveComiss: item2.haveComiss
        }
      });
      setInvoiceDetail(invoiceProducts);
      setOpenModalInvoices(false);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSaveInvoicing = () => {
    if (dataCashBox && !dataCashBox.cashId) {
      return;
    }

    setSendFormIndex(true);
    if (!isFormValidIndex) {
      return;
    }
    if (invoiceDetail.length === 0) {
      notification('warning', 'msg.required.select.product', 'alert.warning.title');
      return;
    }

    if (id && id > 0) {
      notification('warning', 'msg.alert.invoice.saved', 'alert.warning.title');
      return;
    }

    // El checkout (validar stock, kardex, partida contable y CxC en una sola
    // transacción) se dispara al aceptar el pago en ModalPayment, no acá — así no se
    // crea factura/detalle antes de saber si el proceso completo puede terminar.
    const newListTypePayments = listTypePayments.map(item => ({ ...item, value: 0 }));
    setListTypePayments(newListTypePayments);
    setOpenModalPayment(true);
  }

  const fnCheckoutSuccess = (resultData) => {
    onInputChangeIndex({ target: { name: 'id', value: resultData.id } });
    onInputChangeIndex({ target: { name: 'documentId', value: resultData.documentId } });
    const dataPrint = {
      id: resultData.id, userName: userData.name, typePrint: printType
    }
    setLoading(true);
    request.GETPdfUrl('billing/process/invoices/exportInvoicePDF', dataPrint, (resp) => {
      setDocumentPath(resp);
      setOpenViewFile(true);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnPrintInvoicing = () => {
    if (id > 0) {
      const dataPrint = {
        id, userName: userData.name, typePrint: printType
      }

      request.GETPdfUrl('billing/process/invoices/exportInvoicePDF', dataPrint, (resp) => {
        setDocumentPath(resp);
        setOpenViewFile(true);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnCancelInvoicing = () => {
    if (id > 0) {
      setOpenMsgCancelInvoice(true);
    }
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

  const fnCashOpening = () => {
    if (dataCashBox && dataCashBox.cashId) {
      return;
    }
    setOpenModalCashOpening(true);
  }

  const fnCashClosing = () => {
    if (dataCashBox && !dataCashBox.cashId) {
      return;
    }
    setOpenModalCashClose(true);
  }

  const fnCashOut = () => {
    if (dataCashBox && !dataCashBox.cashId) {
      return;
    }
    setOpenModalCashOut(true);
  }

  const fnCancellations = () => {
    if (dataCashBox && !dataCashBox.cashId) {
      return;
    }
    setOpenModalCancellations(true);
  }

  const fnQuotation = () => {
    if (id > 0) {
      setOpenModalQuotation(true);
    }
  }

  const fnSelectProduct = (item) => {
    // No se usa onResetFormDetail() acá: reseteaba TODO el formulario de detalle,
    // incluyendo areaId/storeId/typePrice — el usuario los elige una vez y agrega
    // varios productos contra esa misma área/almacén, así que no deben perderse al
    // seleccionar cada producto. Solo se limpia lo propio del producto anterior.
    const newProduct = {
      productCode: item.productCode,
      description: item.productName,
      unitProd: item.undoutName,
      taxPercent: validFloat(item.taxPercent),
      qty: 1,
      discountPercent: 0,
      discountValue: 0,
      priceLocalMin: item.min,
      priceLocalMid: item.med,
      priceLocalMax: item.max,
      unitedCoste: item.costValue,
      unitedOut: item.undoutName,
      // El factor de conversión de unidad (ej. Caja=5 unidades) — el kardex se rebaja
      // multiplicando qty * qtyDist, así que un valor incorrecto acá descuadra el
      // inventario real de lo vendido.
      qtyDist: validFloat(item.valChange) > 0 ? validFloat(item.valChange) : 1,
      haveComiss: item.paymentComiss,
      productType: validInt(item.typeId)
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
    if (dataCashBox && !dataCashBox.cashId) {
      return;
    }
    setLoading(true);
    setListProducts([]);
    // El buscador del legacy (getProductsForSale) trae productos y servicios juntos en
    // un solo listado — acá el backend los expone en dos endpoints separados
    // (getStocks/getServices), así que se combinan del lado del cliente.
    const mapProduct = (item) => {
      item.taxPercent = item.percentTax
      item.unitProd = item.undoutName
      item.min = item.localMinPrice
      item.med = item.localMedPrice
      item.max = item.localMaxPrice
      item.stock = formatNumber(item.qtyStock)
      item.options = <TableButton color='primary' icon='eye' fnOnClick={() => fnSelectProduct(item)} />
      return item;
    }
    request.GET(buildUrl('inventory/process/stocks/getStocks', { storeId, inStock: true }), (resp) => {
      const products = resp.data.map(mapProduct);
      request.GET('inventory/process/stocks/getServices', (resp2) => {
        const services = resp2.data.map(mapProduct);
        setListProducts([...products, ...services]);
        setOpenModalProducts(true);
        setLoading(false);
      }, (err) => {
        setListProducts(products);
        setOpenModalProducts(true);
        setLoading(false);
      });
    }, (err) => {

      setLoading(false);
    });
  }

  const fnChangePrice = () => {
    if (dataCashBox && !dataCashBox.cashId) {
      return;
    }
    setOpenModalPrice(true);
  }

  const fnAddProduct = () => {
    if (dataCashBox && !dataCashBox.cashId) {
      return;
    }
    setSendFormDetail(true);
    if (!isFormValidDetail) {
      return;
    }

    if (hasSellerControl && validInt(cashierId) === 0) {
      notification('warning', 'msg.required.select.seller', 'alert.warning.title');
      return;
    }

    const taxedValue = taxValue > 0 ? subtotal : 0;
    const exemptValue = taxValue === 0 ? subtotal : 0;

    // Cambiar codigo de vendedor
    const filterSellers = listSellers.filter((item) => {
      return item.value === validInt(cashierId);
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
      productType: validInt(productType)
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
      productType: 0
    }
    setBulkFormDetail(cleanProd);
    setSendFormDetail(false);
  }

  const fnDeleteProduct = (itemProd) => {
    const newArray = invoiceDetail.filter((item) => item.id !== itemProd.id);
    setInvoiceDetail(newArray);

    const sumSubtotal = newArray.map(item => validFloat(item.subtotal)).reduce((prev, curr) => prev + curr, 0);
    const sumDiscount = newArray.map(item => validFloat(item.discountValue)).reduce((prev, curr) => prev + curr, 0);
    const sumExempt = newArray.map(item => validFloat(item.exempt)).reduce((prev, curr) => prev + curr, 0);

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
          name: item.nomcli
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
    request.GET('admin/users/getSellers', (resp) => {
      const sellers = resp.data.map((item) => {
        return {
          label: `${item.sellerCode} | ${item.name}`,
          value: item.id,
          code: item.sellerCode,
          isSeller: 1,
          name: item.name
        }
      });
      setListSellers(sellers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/users/getCashiers', (resp) => {
      const cashiers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          isCashier: 1,
          name: item.name
        }
      });
      setListCashiers(cashiers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('billing/settings/cashRegisters?status=1', (resp) => {
      const cashRegisters = resp.data;
      setListCashBoxes(cashRegisters);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    request.GET('billing/settings/paymentTypeDetails?status=1', (resp) => {
      const payments = resp.data.map(item => {
        return {
          id: item.id,
          name: item.description,
          value: 0
        }
      });
      setListTypePayments(payments);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListLedgerAccount(listAccounts);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    request.GET('billing/settings/expensesTypes', (resp) => {
      const cashOut = resp.data;
      setListTypeExpenses(cashOut);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    request.GET('admin/companies/getOperationalSettings', (resp) => {
      setHasSellerControl(!!resp.data.hasSellerControl);
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

  const propsToControlPanel = {
    fnNew: fnNewInvoicing,
    fnSearch: fnSearchInvoicing,
    fnSave: fnSaveInvoicing,
    fnPrint: fnPrintInvoicing,
    fnCancel: fnCancelInvoicing,
    buttonsHome: [
      {
        title: "button.cashOpening",
        icon: "bi bi-cash",
        onClick: fnCashOpening
      },
      {
        title: "button.cashClosing",
        icon: "bi bi-cash-coin",
        onClick: fnCashClosing
      },
      {
        title: "button.cashOut",
        icon: "iconsminds-financial",
        onClick: fnCashOut
      },
      {
        title: "button.cancellations",
        icon: "bi bi-cash-stack",
        onClick: fnCancellations
      },
      {
        title: "button.quotation",
        icon: "bi bi-file-text",
        onClick: fnQuotation
      }
    ],
    buttonsOptions: [],
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

  const propsToModalInvoices = {
    ModalContent: ModalViewInvoi,
    title: "page.invoicing.modal.invoices.title",
    open: openModalInvoices,
    setOpen: setOpenModalInvoices,
    maxWidth: 'xl',
    classNames: "modal-fullscreen-lg-down",
    data: {
      dataInvoicing
    }
  }

  const propsToModalCashOpening = {
    ModalContent: ModalCashOpening,
    title: "page.pointSales.modal.cashOpening.title",
    open: openModalCashOpening,
    setOpen: setOpenModalCashOpening,
    maxWidth: 'sm',
    data: {
      setBulkFormDetail,
      setBulkFormIndex,
      listCashBoxes,
      listAreas,
      userData,
      setLoading
    }
  }

  const propsToModalCashClose = {
    ModalContent: ModalCashclose,
    title: "page.pointSales.modal.cashClose.title",
    open: openModalCashClose,
    setOpen: setOpenModalCashClose,
    maxWidth: "lg",
    data: {
      cashId: dataCashBox ? dataCashBox.cashId : 0,
      cashierId: dataCashBox ? dataCashBox.cashierId : 0,
      listCashBoxes,
      listCashiers,
      printType,
      setLoading
    }
  }

  const propsToModalCashOut = {
    ModalContent: ModalCashOut,
    title: "page.pointSales.modal.cashOut.title",
    open: openModalCashOut,
    setOpen: setOpenModalCashOut,
    maxWidth: "lg",
    data: {
      dateInProcess,
      cashId: dataCashBox ? dataCashBox.cashId : 0,
      cashierId: dataCashBox ? dataCashBox.cashierId : 0,
      listTypeExpenses,
      setLoading
    }
  }

  const propsToModalCancellations = {
    ModalContent: ModalCancellations,
    title: "page.pointSales.modal.cancellations.title",
    open: openModalCancellations,
    setOpen: setOpenModalCancellations,
    maxWidth: "lg",
    data: {
      cashId: dataCashBox ? dataCashBox.cashId : 0,
      cashierId: dataCashBox ? dataCashBox.cashierId : 0,
      listTypeDocuments,
      listCustomers,
      listCashBoxes,
      listCashiers,
      listTypePayments,
      setListTypePayments,
      listLedgerAccount,
      printType,
      setLoading,
      userData
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
      dateInProcess,
      customerDNI,
      customerName,
      setLoading
    }
  }

  const propsToPayment = {
    ModalContent: ModalPayment,
    title: "page.pointSales.modal.payment.title",
    open: openModalPayment,
    setOpen: setOpenModalPayment,
    maxWidth: "md",
    data: {
      id,
      dateInProcess,
      total,
      cashId: dataCashBox ? dataCashBox.cashId : 0,
      cashierId: dataCashBox ? dataCashBox.cashierId : 0,
      customerId,
      customerDNI,
      customerName,
      userName: userData.name,
      typePrint: printType,
      listTypePayments,
      setListTypePayments,
      setLoading,
      invoiceHeader: {
        documentCode,
        notes,
        date: dateInProcess === '' ? DateHelper.format(new Date()) : dateInProcess,
        customerId,
        subtotalValue: subTotalValue,
        discountValue: discount,
        subtotTaxValue,
        subtotExeValue: subTotExeValue,
        subtotExoValue: subTotExoValue,
        taxValue: taxValueInvoice,
        total,
        isPos: 1,
        currency: validInt(currency),
        customerDNI,
        customerName,
        documentType: validInt(documentType),
        documentExo,
        cashId: dataCashBox ? dataCashBox.cashId : 0,
        cashierId: dataCashBox ? dataCashBox.cashierId : 0,
        valueCustomer,
        valueRestore
      },
      invoiceDetail,
      fnCheckoutSuccess
    }
  }

  const propsToInvoicingForm = {
    documentCode, customerId, notes, documentType, currency, printType, date, dateInProcess, areaId, storeId, cashierId,
    documentExo, listTypeDocuments, listCustomers, listAreas, listWarehouse, listSellers, handleAreaChange, handleExemptChange,
    recordSelected, onInputChangeIndex, formValidationIndex, sendFormIndex, setBulkFormIndex, hasSellerControl
  }

  const propsToInvoicingDetail = {
    productCode, description, unitProd, qty, price, subtotal, discountPercent, discountValue, taxPercent, taxValue,
    totalProd, onInputDetaChange, handleQtyChange, handlePriceChange, handleDiscPercentChange, handleTaxPercentChange,
    fnViewProducts, fnChangePrice, fnAddProduct, formValidationDetail, sendFormDetail
  }

  const propsToInvoicingTable = {
    invoiceDetail, subTotalValue, discount, subTotExeValue, subTotExoValue, subtotTaxValue, taxValueInvoice, total, onInputChangeIndex,
    fnDeleteProduct
  }

  const propsToMsgCancelInvoice = {
    open: openMsgCancelInvoice,
    setOpen: setOpenMsgCancelInvoice,
    fnOnOk: fnCancelInvoice,
    title: "msg.question.cancelInvoice.title"
  }

  const propsToViewPDF = {
    ModalContent: ViewPdf,
    title: "modal.viewDocument.invoice",
    valueTitle: documentId,
    open: openViewFile,
    setOpen: setOpenViewFile,
    maxWidth: 'xl',
    data: {
      documentPath
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <InvoicingForm {...propsToInvoicingForm} />
              <InvoicingDetail {...propsToInvoicingDetail} />
              <InvoicingTable {...propsToInvoicingTable} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalProducts} />
      <Modal {...propsToModalPrices} />
      <Modal {...propsToModalInvoices} />
      <Modal {...propsToModalCashOpening} />
      <Modal {...propsToModalCashClose} />
      <Modal {...propsToModalCashOut} />
      <Modal {...propsToModalCancellations} />
      <Modal {...propsToModalQuotation} />
      <Modal {...propsToPayment} />
      <Modal {...propsToViewPDF} />
      <Confirmation {...propsToMsgCancelInvoice} />
    </>
  );
}
export default PointSales;